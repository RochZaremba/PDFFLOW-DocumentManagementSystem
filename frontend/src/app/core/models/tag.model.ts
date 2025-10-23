export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface TagStats {
  tag: Tag;
  count: number;
}

export interface AssignTagsRequest {
  tagNames: string[];
}
