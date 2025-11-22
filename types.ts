export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Detection {
  id: string;
  label: string;
  risk: RiskLevel;
  bbox: BoundingBox; // Normalized 0-1000
  description?: string;
}

export interface ScanResult {
  score: number; // 0-100, where 100 is perfectly safe, 0 is highly sensitive
  contextAnalysis: string;
  detections: Detection[];
  suggestedAction: 'none' | 'blur_faces' | 'redact_text' | 'block_upload';
}

export enum AppMode {
  DASHBOARD = 'dashboard',
  LIVE_MIRROR = 'live_mirror',
  SETTINGS = 'settings',
}
