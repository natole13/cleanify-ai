export type BgMode = 'transparent' | 'white' | 'black' | 'custom'
export type OutputFormat = 'jpg' | 'png' | 'webp' | 'avif' | 'tiff'
export type WatermarkType = 'text' | 'image'
export type HPosition = 'left' | 'center' | 'right' | 'tiled'
export type VPosition = 'top' | 'center' | 'bottom' | 'tiled'

export const WATERMARK_FONTS = [
  'Arial', 'Courier', 'Cursive', 'Fantasy', 'Georgia',
  'Helvetica', 'Impact', 'Monospace', 'Palatino',
  'Sans Serif', 'Serif', 'System UI', 'Times', 'Verdana',
] as const
export type WatermarkFont = (typeof WATERMARK_FONTS)[number]

export interface WatermarkConfig {
  enabled: boolean
  type: WatermarkType
  text: string
  font: WatermarkFont
  color: string
  background_text: boolean
  h_position: HPosition
  v_position: VPosition
  rotation: number   // 0–360
  size: number       // 0–100 (%)
  opacity: number    // 0–100 (%)
}

export interface OutputConfig {
  format: OutputFormat
  quality: number
  rename_pattern: string
}

export interface ResizeConfig {
  enabled: boolean
  width: number
  height: number
}

export interface BatchFile {
  id: string
  name: string
  url: string
  source: 'upload' | 'url'
}

export interface PipelineConfig {
  remove_watermark: boolean
  remove_background: boolean
  generative_fill: boolean
  bg_mode: BgMode
  bg_custom: string
  upscale: boolean
  upscale_factor: 2 | 4
  object_removal_prompt: string
  compress: boolean
  compress_quality: number
  watermark: WatermarkConfig
  resize: ResizeConfig
  output: OutputConfig
  // Photo Enhancer
  enhance: boolean
  brightness: number   // 25–200, default 100 (= 1.0×)
  contrast: number     // 25–200, default 100
  saturation: number   // 0–200, default 100
  sharpness: number    // 0–300, default 100
  // Unblur
  unblur: boolean
  unblur_strength: number  // 1–5, default 2
}

export const defaultConfig: PipelineConfig = {
  remove_watermark: true,
  remove_background: false,
  generative_fill: false,
  bg_mode: 'transparent',
  bg_custom: '#f0f0f0',
  upscale: false,
  upscale_factor: 4,
  object_removal_prompt: '',
  compress: false,
  compress_quality: 80,
  watermark: {
    enabled: false,
    type: 'text',
    text: 'Cleanify.ai',
    font: 'Arial',
    color: '#FFFFFF',
    background_text: false,
    h_position: 'center',
    v_position: 'center',
    rotation: 0,
    size: 6,
    opacity: 55,
  },
  resize: {
    enabled: false,
    width: 2048,
    height: 2048,
  },
  output: {
    format: 'jpg',
    quality: 90,
    rename_pattern: '{name}_clean',
  },
  enhance: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 100,
  unblur: false,
  unblur_strength: 2,
}

const BG_MAP: Record<Exclude<BgMode, 'custom'>, string> = {
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
}

export const LOSSY_FORMATS: OutputFormat[] = ['jpg', 'webp', 'avif']

export function previewRename(
  pattern: string,
  name: string,
  index: number,
  format: OutputFormat
): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return (
    pattern
      .replace(/\{name\}/g, name)
      .replace(/\{index:(\d+)\}/g, (_, len) => String(index).padStart(parseInt(len), '0'))
      .replace(/\{index\}/g, String(index))
      .replace(/\{date\}/g, today) || name
  ) + '.' + format
}

export function buildPipelineJSON(config: PipelineConfig, batchCount: number): object {
  const pipeline: Record<string, unknown> = {}

  if (config.remove_watermark) pipeline.remove_watermark = true
  if (config.remove_background) {
    pipeline.remove_background = true
    pipeline.background =
      config.bg_mode === 'custom' ? config.bg_custom : BG_MAP[config.bg_mode]
    if (config.generative_fill) pipeline.generative_fill = true
  }
  if (config.object_removal_prompt.trim()) {
    pipeline.object_removal = { prompt: config.object_removal_prompt.trim() }
  }
  if (config.upscale) {
    pipeline.upscale = true
    pipeline.upscale_factor = config.upscale_factor
  }
  if (config.unblur) {
    pipeline.unblur = true
    pipeline.unblur_strength = config.unblur_strength
  }
  if (config.enhance) {
    pipeline.enhance = true
    pipeline.brightness = config.brightness / 100
    pipeline.contrast   = config.contrast   / 100
    pipeline.saturation = config.saturation / 100
    pipeline.sharpness  = config.sharpness  / 100
  }
  if (config.watermark.enabled) {
    const wm = config.watermark
    pipeline.watermark =
      wm.type === 'text'
        ? {
            type: 'text',
            text: wm.text,
            font: wm.font,
            color: wm.color,
            background_text: wm.background_text,
            h_position: wm.h_position,
            v_position: wm.v_position,
            rotation: wm.rotation,
            size_pct: wm.size,
            opacity: Math.round(wm.opacity) / 100,
          }
        : {
            type: 'image',
            h_position: wm.h_position,
            v_position: wm.v_position,
            rotation: wm.rotation,
            size_pct: wm.size,
            opacity: Math.round(wm.opacity) / 100,
          }
  }
  if (config.resize.enabled) {
    pipeline.resize = { width: config.resize.width, height: config.resize.height }
  }
  if (config.compress) {
    pipeline.compress = { quality: config.compress_quality }
  }
  pipeline.output = {
    format: config.output.format,
    ...(LOSSY_FORMATS.includes(config.output.format) && { quality: config.output.quality }),
  }
  pipeline.batch = { total: batchCount }
  return { pipeline }
}
