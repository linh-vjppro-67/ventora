import React, { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

import type { DesignRequest, DesignRequestStatus, Approval, ApprovalStatus } from "@/types";
import { mockDesignRequests, mockApprovals } from "@/data/mockData";

// --- Types (local) ---
export type DrawingStatus = "draft" | "review" | "approved" | "issued";

export type DrawingFile = {
  id: string;
  folderId: string;
  name: string;
  discipline: "ARC" | "STR" | "MEP" | "CIV";
  version: number;
  lastUpdated: string;
  reviewer: string;
  status: DrawingStatus;
  // store short history for compare (mock)
  history: Array<{ version: number; updatedAt: string; updatedBy: string; note?: string }>;
};

export type DrawingFolder = {
  id: string;
  name: string;
  parentId?: string;
};

export type DesignComment = { id: string; author: string; content: string; at: string };
export type DesignAttachment = { id: string; name: string; kind: "pdf" | "dwg" | "img"; at: string };
export type DesignVersion = { id: string; version: number; note: string; by: string; at: string };

type EngineeringState = {
  designRequests: DesignRequest[];
  designMeta: Record<
    string,
    {
      brief?: string;
      attachments: DesignAttachment[];
      comments: DesignComment[];
      versions: DesignVersion[];
    }
  >;
  approvals: Approval[];
  folders: DrawingFolder[];
  drawings: DrawingFile[];
};

type EngineeringActions = {
  updateDesignStatus: (id: string, status: DesignRequestStatus) => void;
  addDesignComment: (id: string, content: string) => void;
  addDesignAttachmentMock: (id: string) => void;
  uploadDesignVersionMock: (id: string) => void;
  submitDesignForApproval: (id: string) => void;
  approveDesign: (approvalId: string) => void;
  rejectDesign: (approvalId: string) => void;

  setActiveFolder: (folderId: string) => void;
  activeFolderId: string;
  uploadNewDrawingVersionMock: (fileId: string) => void;
  markDrawingApproved: (fileId: string) => void;
  markDrawingIssued: (fileId: string) => void;
};

const EngineeringCtx = createContext<(EngineeringState & EngineeringActions) | null>(null);

function nowISO() {
  return new Date().toISOString();
}

function nextReqStatus(s: DesignRequestStatus): DesignRequestStatus {
  const order: DesignRequestStatus[] = ["new", "in-progress", "review", "approved", "released"];
  const i = order.indexOf(s);
  return order[Math.min(order.length - 1, i + 1)];
}

function prevReqStatus(s: DesignRequestStatus): DesignRequestStatus {
  const order: DesignRequestStatus[] = ["new", "in-progress", "review", "approved", "released"];
  const i = order.indexOf(s);
  return order[Math.max(0, i - 1)];
}

const seedFolders: DrawingFolder[] = [
  { id: "fd-arc", name: "Architectural (ARC)" },
  { id: "fd-str", name: "Structural (STR)" },
  { id: "fd-mep", name: "MEP" },
  { id: "fd-civ", name: "Civil" },
  { id: "fd-arc-abc", name: "ABC Tower", parentId: "fd-arc" },
  { id: "fd-str-abc", name: "ABC Tower", parentId: "fd-str" },
  { id: "fd-mep-abc", name: "ABC Tower", parentId: "fd-mep" },
  { id: "fd-arc-mall", name: "Mega Mall", parentId: "fd-arc" },
  { id: "fd-str-mall", name: "Mega Mall", parentId: "fd-str" },
];

const seedDrawings: DrawingFile[] = [
  {
    id: "dwg-001",
    folderId: "fd-arc-abc",
    name: "ARC_Lobby_Level01.dwg",
    discipline: "ARC",
    version: 2,
    lastUpdated: "2024-04-05",
    reviewer: "Nguyễn Văn An",
    status: "review",
    history: [
      { version: 1, updatedAt: "2024-04-02", updatedBy: "Lê Minh Cường", note: "Initial draft" },
      { version: 2, updatedAt: "2024-04-05", updatedBy: "Lê Minh Cường", note: "Updated layout" },
    ],
  },
  {
    id: "dwg-002",
    folderId: "fd-str-abc",
    name: "STR_ShopDrawing_L12-L15.pdf",
    discipline: "STR",
    version: 3,
    lastUpdated: "2024-04-08",
    reviewer: "Phạm Hoàng Dũng",
    status: "approved",
    history: [
      { version: 1, updatedAt: "2024-03-29", updatedBy: "Nguyễn Văn An" },
      { version: 2, updatedAt: "2024-04-03", updatedBy: "Nguyễn Văn An" },
      { version: 3, updatedAt: "2024-04-08", updatedBy: "Nguyễn Văn An", note: "Rebar fixes" },
    ],
  },
  {
    id: "dwg-003",
    folderId: "fd-mep-abc",
    name: "MEP_HVAC_Level10.pdf",
    discipline: "MEP",
    version: 1,
    lastUpdated: "2024-04-10",
    reviewer: "Nguyễn Thị Hương",
    status: "draft",
    history: [{ version: 1, updatedAt: "2024-04-10", updatedBy: "Nguyễn Thị Hương", note: "First issue" }],
  },
  {
    id: "dwg-004",
    folderId: "fd-arc-mall",
    name: "ARC_FoodCourt_AsBuilt.pdf",
    discipline: "ARC",
    version: 2,
    lastUpdated: "2024-04-30",
    reviewer: "Võ Thành Đạt",
    status: "issued",
    history: [
      { version: 1, updatedAt: "2024-04-18", updatedBy: "Phạm Hoàng Dũng" },
      { version: 2, updatedAt: "2024-04-30", updatedBy: "Phạm Hoàng Dũng", note: "As-built" },
    ],
  },
];

export function EngineeringProvider({ children }: { children: React.ReactNode }) {
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>(mockDesignRequests);
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
  const [designMeta, setDesignMeta] = useState<EngineeringState["designMeta"]>(() => {
    // seed basic meta for each request
    const m: EngineeringState["designMeta"] = {};
    for (const dr of mockDesignRequests) {
      m[dr.id] = {
        brief:
          "Mô tả ngắn (mock): yêu cầu thiết kế từ PM, cần có bản vẽ/biện pháp/tiêu chuẩn kèm theo để kỹ thuật triển khai.",
        attachments: [
          { id: `${dr.id}-att-1`, name: "Brief.pdf", kind: "pdf", at: "2024-04-01" },
          { id: `${dr.id}-att-2`, name: "SitePhoto.png", kind: "img", at: "2024-04-01" },
        ],
        comments: [
          { id: `${dr.id}-cmt-1`, author: "PM", content: "Ưu tiên theo tiến độ thi công thực tế.", at: "2024-04-02" },
        ],
        versions: [
          { id: `${dr.id}-v1`, version: 1, note: "Initial", by: dr.assignee, at: dr.createdAt },
        ],
      };
    }
    return m;
  });
  const [folders] = useState<DrawingFolder[]>(seedFolders);
  const [drawings, setDrawings] = useState<DrawingFile[]>(seedDrawings);
  const [activeFolderId, setActiveFolderId] = useState<string>("fd-arc-abc");

  const updateDesignStatus = (id: string, status: DesignRequestStatus) => {
    setDesignRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const addDesignComment = (id: string, content: string) => {
    const text = content.trim();
    if (!text) return;
    setDesignMeta((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? { attachments: [], comments: [], versions: [] };
      cur.comments = [...cur.comments, { id: `${id}-cmt-${cur.comments.length + 1}`, author: "You", content: text, at: nowISO().slice(0, 10) }];
      next[id] = { ...cur };
      return next;
    });
    toast.success("Đã thêm comment (mock)");
  };

  const addDesignAttachmentMock = (id: string) => {
    setDesignMeta((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? { attachments: [], comments: [], versions: [] };
      const candidates: Array<DesignAttachment> = [
        { id: `${id}-att-${cur.attachments.length + 1}`, name: "Spec_Sketch.pdf", kind: "pdf", at: nowISO().slice(0, 10) },
        { id: `${id}-att-${cur.attachments.length + 1}`, name: "Markups.png", kind: "img", at: nowISO().slice(0, 10) },
        { id: `${id}-att-${cur.attachments.length + 1}`, name: "DWG_Reference.dwg", kind: "dwg", at: nowISO().slice(0, 10) },
      ];
      const pick = candidates[cur.attachments.length % candidates.length];
      cur.attachments = [...cur.attachments, pick];
      next[id] = { ...cur };
      return next;
    });
    toast.success("Upload attachment (mock) thành công");
  };

  const uploadDesignVersionMock = (id: string) => {
    setDesignMeta((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? { attachments: [], comments: [], versions: [] };
      const v = (cur.versions[cur.versions.length - 1]?.version ?? 0) + 1;
      cur.versions = [
        ...cur.versions,
        { id: `${id}-v${v}`, version: v, note: `Upload v${v} (mock)`, by: "You", at: nowISO().slice(0, 10) },
      ];
      next[id] = { ...cur };
      return next;
    });
    setDesignRequests((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: x.status === "new" ? "in-progress" : x.status } : x))
    );
    toast.success("Upload new version (mock)");
  };

  const submitDesignForApproval = (id: string) => {
    const dr = designRequests.find((x) => x.id === id);
    if (!dr) return;

    // prevent duplicate pending approvals for same item
    const hasPending = approvals.some((a) => a.type === "design" && a.itemId === id && a.status === "pending");
    if (hasPending) {
      toast.info("Đã có approval pending cho yêu cầu này.");
      return;
    }

    const newApproval: Approval = {
      id: `appr-design-${Math.random().toString(16).slice(2, 8)}`,
      type: "design",
      itemId: id,
      itemCode: dr.code,
      itemName: dr.title,
      requestedBy: dr.assignee,
      requestedAt: nowISO().slice(0, 10),
      status: "pending",
    };
    setApprovals((prev) => [newApproval, ...prev]);
    updateDesignStatus(id, "review");
    toast.success("Đã gửi duyệt (mock)");
  };

  const approveDesign = (approvalId: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === approvalId ? { ...a, status: "approved" as ApprovalStatus } : a)));
    const a = approvals.find((x) => x.id === approvalId);
    if (a?.itemId) {
      const dr = designRequests.find((x) => x.id === a.itemId);
      if (dr) updateDesignStatus(dr.id, nextReqStatus(dr.status));
    }
    toast.success("Approved (mock)");
  };

  const rejectDesign = (approvalId: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === approvalId ? { ...a, status: "rejected" as ApprovalStatus } : a)));
    const a = approvals.find((x) => x.id === approvalId);
    if (a?.itemId) {
      const dr = designRequests.find((x) => x.id === a.itemId);
      if (dr) updateDesignStatus(dr.id, prevReqStatus(dr.status));
    }
    toast.error("Rejected (mock)");
  };

  const uploadNewDrawingVersionMock = (fileId: string) => {
    setDrawings((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const nextVersion = f.version + 1;
        const today = nowISO().slice(0, 10);
        return {
          ...f,
          version: nextVersion,
          lastUpdated: today,
          status: "review",
          history: [...f.history, { version: nextVersion, updatedAt: today, updatedBy: "You", note: "Upload new version (mock)" }],
        };
      })
    );
    toast.success("Upload new drawing version (mock)");
  };

  const markDrawingApproved = (fileId: string) => {
    setDrawings((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "approved" } : f)));
    toast.success("Marked approved");
  };

  const markDrawingIssued = (fileId: string) => {
    setDrawings((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "issued" } : f)));
    toast.success("Marked issued");
  };

  const value = useMemo(
    () => ({
      designRequests,
      designMeta,
      approvals,
      folders,
      drawings,
      activeFolderId,
      setActiveFolder: setActiveFolderId,
      updateDesignStatus,
      addDesignComment,
      addDesignAttachmentMock,
      uploadDesignVersionMock,
      submitDesignForApproval,
      approveDesign,
      rejectDesign,
      uploadNewDrawingVersionMock,
      markDrawingApproved,
      markDrawingIssued,
    }),
    [designRequests, designMeta, approvals, folders, drawings, activeFolderId]
  );

  return <EngineeringCtx.Provider value={value}>{children}</EngineeringCtx.Provider>;
}

export function useEngineering() {
  const ctx = useContext(EngineeringCtx);
  if (!ctx) throw new Error("useEngineering must be used within EngineeringProvider");
  return ctx;
}
