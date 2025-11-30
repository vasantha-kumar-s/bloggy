export type Status = 'PENDING' | 'PROCESSING' | 'REVIEW' | 'APPROVED' | 'REJECTED';

export interface Blog {
    id?: number;
    title: string;
    author: string;
    content: string;
    status: Status;
    tags: string;
    seoScore: number;
    aiSimilarityScore: number;
    profanityFound: boolean;
    createdAt: string;
    updatedAt: string;
}