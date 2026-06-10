// ─── Tool definitions ─────────────────────────────────────────────────────────

export interface UseCase {
  icon: string
  title: string
  desc: string
}

export interface HowItWorksStep {
  step: string
  title: string
  desc: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface Stat {
  value: string
  label: string
}

export interface ToolDefinition {
  slug: string
  name: string
  emoji: string
  category: 'image' | 'video'
  tagline: string
  description: string
  heroTitle: string
  heroSubtitle: string
  useCases: UseCase[]
  howItWorks: HowItWorksStep[]
  faq: FaqItem[]
  stats: Stat[]
}

// ─── All tools ────────────────────────────────────────────────────────────────

export const ALL_TOOLS: ToolDefinition[] = [
  // ── IMAGE TOOLS ──────────────────────────────────────────────────────────────

  {
    slug: 'watermark-remover',
    name: 'Watermark Remover',
    emoji: '🪄',
    category: 'image',
    tagline: 'Remove any watermark from photos instantly with AI.',
    description:
      'Our AI engine detects and erases text stamps, logo overlays, semi-transparent watermarks, and diagonal text patterns in seconds. The underlying pixels are intelligently reconstructed so the result looks completely natural — no blur patches, no artifacts.',
    heroTitle: 'Remove Watermarks Instantly',
    heroSubtitle: 'AI-powered detection and inpainting. Works on text, logos, and semi-transparent overlays.',
    useCases: [
      { icon: '📸', title: 'Stock Photo Buyers', desc: 'Preview stock images before purchase — remove preview watermarks to check composition and fit for your project.' },
      { icon: '🛒', title: 'E-commerce Teams', desc: 'Clean up supplier product photos that arrive with agency or stock watermarks before listing them on your store.' },
      { icon: '🎨', title: 'Graphic Designers', desc: 'Quickly iterate on design mockups using reference images without watermark clutter distracting the client review.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your image', desc: 'Drop any JPG, PNG, WEBP, or AVIF file. Up to 50 MB per image.' },
      { step: '02', title: 'AI detects the watermark', desc: 'The model scans for text, logos, and semi-transparent overlays and automatically creates a removal mask.' },
      { step: '03', title: 'Download clean result', desc: 'Your watermark-free image is ready in seconds. Export as PNG or JPG at original resolution.' },
    ],
    faq: [
      { q: 'Can it remove diagonal or rotated watermarks?', a: 'Yes. The model handles watermarks at any angle, including diagonal text and rotated logos.' },
      { q: 'Does it work on semi-transparent watermarks?', a: 'Absolutely. Our inpainting engine is specifically trained on semi-transparent overlays and handles them cleanly.' },
      { q: 'Will the background look natural after removal?', a: 'In most cases yes — the AI reconstructs the hidden pixels. Complex textures behind the watermark may show minor artifacts on the first pass; use the precision brush to refine.' },
      { q: 'Is there a batch mode?', a: 'Yes — use the Batch Watermark Remover tool to process thousands of images in one upload.' },
    ],
    stats: [
      { value: '12M+', label: 'Watermarks removed' },
      { value: '99.4%', label: 'Clean removal rate' },
      { value: '1.3s', label: 'Average per image' },
    ],
  },

  {
    slug: 'object-remover',
    name: 'Object Remover',
    emoji: '✂️',
    category: 'image',
    tagline: 'Erase any unwanted object from a photo — background fills itself.',
    description:
      'Brush over any object — a person, power line, piece of furniture, or stray prop — and our generative AI fills the gap with a coherent background. The result blends seamlessly with the surrounding scene, making the object disappear as if it was never there.',
    heroTitle: 'Erase Anything From Your Photos',
    heroSubtitle: 'Paint over distractions and watch them vanish. AI fills the gap perfectly.',
    useCases: [
      { icon: '🏡', title: 'Real Estate Photographers', desc: 'Remove cars from driveways, trash bins from curbs, and unwanted furniture from room shots before listings go live.' },
      { icon: '✈️', title: 'Travel Bloggers', desc: 'Erase tourists and crowds from your travel photos to get that perfect, empty-vista shot every time.' },
      { icon: '🎞️', title: 'Portrait Photographers', desc: 'Clean up distracting elements in the background — cables, signs, passersby — without a full reshoot.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your photo', desc: 'Supports JPG, PNG, WEBP, and AVIF up to 50 MB.' },
      { step: '02', title: 'Paint the object', desc: 'Use the brush tool to mark the area you want removed. A generous selection works best.' },
      { step: '03', title: 'AI fills the gap', desc: 'Generative inpainting reconstructs the background in seconds. Refine with the brush if needed.' },
    ],
    faq: [
      { q: 'How large can the object be?', a: 'The object can occupy up to about 60% of the frame. For very large areas, multiple smaller passes work better.' },
      { q: 'Can I remove people from photos?', a: 'Yes, people are one of the most common use cases. The AI reconstructs the background behind them.' },
      { q: 'What if the background is complex (e.g., a crowd or trees)?', a: 'Complex backgrounds take slightly more processing time. The result is generally very good; use the refine brush for edge cleanup.' },
      { q: 'Does it work on raw product photos?', a: 'Yes — great for removing props, price tags, or distracting labels from product shots.' },
    ],
    stats: [
      { value: '4M+', label: 'Objects removed' },
      { value: '98.1%', label: 'Seamless fills' },
      { value: '2.1s', label: 'Average per image' },
    ],
  },

  {
    slug: 'ai-photo-editor',
    name: 'AI Photo Editor',
    emoji: '🎨',
    category: 'image',
    tagline: 'Smart, one-click photo editing powered by generative AI.',
    description:
      'Relight, recolor, resize, and retouch photos using natural language or one-click presets. Whether you need to swap a background, adjust exposure, or apply a cinematic grade, the AI understands your intent and delivers professional results without manual sliders.',
    heroTitle: 'Edit Photos With a Single Prompt',
    heroSubtitle: 'AI understands your intent. No manual sliders, no learning curve.',
    useCases: [
      { icon: '📱', title: 'Social Media Managers', desc: 'Quickly adapt imagery to platform aesthetics — warm tones for Instagram, clean neutral tones for LinkedIn — in one click.' },
      { icon: '🖼️', title: 'Art Directors', desc: 'Prototype visual styles and color palettes on real photos before committing to a full photoshoot or retouching session.' },
      { icon: '🧑‍💻', title: 'Developers & Startups', desc: 'Generate polished marketing images on the fly without a designer — useful for landing pages, ads, and social posts.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your photo', desc: 'Drop any image or paste a URL. All common formats supported.' },
      { step: '02', title: 'Describe the edit', desc: 'Type what you want: "make the sky golden hour" or "remove blemishes and boost contrast".' },
      { step: '03', title: 'Download or iterate', desc: 'Get your edited photo instantly. Iterate with follow-up prompts until it is perfect.' },
    ],
    faq: [
      { q: 'Can I use natural language to edit?', a: 'Yes — just type what you want changed and the AI applies it. You can also use preset filters if you prefer.' },
      { q: 'Does it support background replacement?', a: 'Yes. Describe or choose a new background and the AI will composite it cleanly.' },
      { q: 'Can I batch edit photos with the same settings?', a: 'Yes — save your edit as a preset and apply it to hundreds of images in one batch run.' },
      { q: 'What is the maximum file size?', a: 'Up to 50 MB per image for individual edits; up to 25 MB per image in batch mode.' },
    ],
    stats: [
      { value: '8M+', label: 'Photos edited' },
      { value: '50+', label: 'AI edit presets' },
      { value: '0.9s', label: 'Average edit time' },
    ],
  },

  {
    slug: 'pdf-watermark-remover',
    name: 'PDF Watermark Remover',
    emoji: '📄',
    category: 'image',
    tagline: 'Strip watermarks from PDF documents without distorting content.',
    description:
      'Extract watermarks from PDF files — "DRAFT", "CONFIDENTIAL", "SAMPLE", or custom logo overlays — while preserving all text, tables, and vector graphics at full fidelity. Works on both raster and vector watermarks embedded in PDF layers.',
    heroTitle: 'Clean PDFs in One Click',
    heroSubtitle: 'Remove DRAFT, CONFIDENTIAL, and logo watermarks. Text and tables stay perfect.',
    useCases: [
      { icon: '⚖️', title: 'Legal Professionals', desc: 'Remove DRAFT or WATERMARKED stamps from contract proofs before sending final versions to clients or courts.' },
      { icon: '🎓', title: 'Students & Researchers', desc: 'Clean up academic paper previews and report drafts for proper presentation in thesis submissions.' },
      { icon: '💼', title: 'Business Consultants', desc: 'Strip CONFIDENTIAL or SAMPLE overlays from report templates when preparing final deliverables for clients.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your PDF', desc: 'Drag in any PDF up to 200 MB. Multi-page documents fully supported.' },
      { step: '02', title: 'AI identifies watermarks', desc: 'The engine detects text-layer and raster watermarks across all pages simultaneously.' },
      { step: '03', title: 'Download clean PDF', desc: 'All watermarks stripped, document integrity preserved. Download in seconds.' },
    ],
    faq: [
      { q: 'Does it work on password-protected PDFs?', a: 'You need to provide the document password for locked PDFs. We do not crack encryption.' },
      { q: 'Will the original layout and fonts be preserved?', a: 'Yes. Only the watermark layer is removed; all text, images, and vector elements remain unchanged.' },
      { q: 'Can it remove watermarks from scanned PDFs?', a: 'Yes — for scanned (image-only) PDFs we apply raster watermark removal to each page image.' },
      { q: 'What is the page limit?', a: 'Up to 500 pages per upload. For larger documents, split them first using a PDF splitter.' },
    ],
    stats: [
      { value: '2M+', label: 'PDFs processed' },
      { value: '99.1%', label: 'Layout preserved' },
      { value: '3.2s', label: 'Average per PDF' },
    ],
  },

  {
    slug: 'remove-text',
    name: 'Remove Text',
    emoji: '✏️',
    category: 'image',
    tagline: 'Erase text overlays, captions, and annotations from any image.',
    description:
      'Detect and remove any text burned into an image — subtitles, copyright notices, price tags, overlay captions, social media handles, or date stamps. The AI reconstructs the underlying scene seamlessly so no ghost text remains.',
    heroTitle: 'Erase Text From Images Cleanly',
    heroSubtitle: 'Captions, date stamps, copyright notices — gone in seconds.',
    useCases: [
      { icon: '📰', title: 'Journalists & Editors', desc: 'Remove expired caption overlays from archival images before republishing in new editorial contexts.' },
      { icon: '🛍️', title: 'Retailers', desc: 'Strip price tag text and sale stickers from product photos received from suppliers before uploading to your store.' },
      { icon: '📲', title: 'Content Creators', desc: 'Remove Instagram handles, date stamps, and location tags from photos repurposed for different platforms.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload the image', desc: 'Drop any JPG, PNG, WEBP, or GIF file with overlaid text.' },
      { step: '02', title: 'AI finds the text', desc: 'OCR + semantic segmentation pinpoints every text region automatically.' },
      { step: '03', title: 'Download text-free image', desc: 'The scene beneath is reconstructed. Manually mark any missed text with the brush tool.' },
    ],
    faq: [
      { q: 'Does it work on images where text is part of a printed design?', a: 'It works best on overlaid text rather than text printed onto physical objects like T-shirts or signs.' },
      { q: 'Can it handle multiple languages?', a: 'Yes — the OCR engine handles Latin, Cyrillic, Arabic, Chinese, Japanese, Korean, and more.' },
      { q: 'What if the text is on a complex background?', a: 'Complex backgrounds take an extra moment but the AI handles most cases. Use the manual brush for stubborn spots.' },
      { q: 'Does it remove text in GIFs frame by frame?', a: 'Yes — animated GIF text removal processes each frame and rebuilds the animation.' },
    ],
    stats: [
      { value: '5M+', label: 'Text overlays removed' },
      { value: '97.8%', label: 'Clean removal rate' },
      { value: '1.5s', label: 'Average per image' },
    ],
  },

  {
    slug: 'unblur-image',
    name: 'Unblur Image',
    emoji: '🔭',
    category: 'image',
    tagline: 'Sharpen blurry photos and recover lost detail with AI.',
    description:
      'Fix motion blur, camera shake, and out-of-focus shots using a diffusion-based deblurring model trained on millions of images. Whether it is a shaky handheld photo or a soft portrait, the AI restores edge clarity and fine texture detail without over-sharpening.',
    heroTitle: 'Unblur Photos in Seconds',
    heroSubtitle: 'AI restores sharpness from motion blur, defocus, and camera shake.',
    useCases: [
      { icon: '🎉', title: 'Event Photographers', desc: 'Rescue fast-moving subject shots — dancing, sports, kids playing — that came out blurry due to motion or low shutter speed.' },
      { icon: '🔍', title: 'Insurance Investigators', desc: 'Enhance blurry surveillance screenshots or accident-scene photos to reveal vehicle plates or details.' },
      { icon: '👨‍👩‍👧', title: 'Families & Individuals', desc: 'Sharpen cherished old photos or motion-blurred candid shots from family events and holidays.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload the blurry image', desc: 'Supports JPG, PNG, WEBP, and HEIC up to 50 MB.' },
      { step: '02', title: 'Select blur type', desc: 'Choose Auto-Detect, Motion Blur, Defocus, or Noise Reduction for optimal results.' },
      { step: '03', title: 'Download sharpened result', desc: 'Edge clarity restored, fine detail recovered. Export at original or 2x resolution.' },
    ],
    faq: [
      { q: 'How blurry can an image be?', a: 'Mild to moderate blur is recovered almost perfectly. Severe motion blur or extreme defocus may still show residual softness.' },
      { q: 'Does it add noise when sharpening?', a: 'No — our model includes a denoising step that runs in parallel with deblurring, keeping the result clean.' },
      { q: 'Can it sharpen text in blurry screenshots?', a: 'Yes — text sharpening is a strong use case and typically produces very crisp, legible results.' },
      { q: 'Will colors be affected?', a: 'No — only the luminance and edge channels are sharpened. Saturation and hues are preserved.' },
    ],
    stats: [
      { value: '3M+', label: 'Images unblurred' },
      { value: '96.5%', label: 'Perceived sharpness gain' },
      { value: '1.8s', label: 'Average per image' },
    ],
  },

  {
    slug: 'photo-enhancer',
    name: 'Photo Enhancer',
    emoji: '⚡',
    category: 'image',
    tagline: 'Auto-enhance exposure, color, and detail in any photo.',
    description:
      'Intelligently correct underexposed shots, flat colors, and poor white balance with a single click. The AI analyzes each photo individually and applies adaptive tone mapping, color grading, and micro-detail enhancement — not a generic one-size filter.',
    heroTitle: 'Make Every Photo Look Professional',
    heroSubtitle: 'Smart tone, color, and detail enhancement — adaptive to each photo.',
    useCases: [
      { icon: '🏘️', title: 'Real Estate Agents', desc: 'Instantly improve poorly lit interior shots and overexposed exterior photos before listing — no photographer required.' },
      { icon: '📦', title: 'Marketplace Sellers', desc: 'Boost color accuracy and contrast on product photos taken in poor lighting to make listings stand out.' },
      { icon: '🌍', title: 'NGOs & Nonprofits', desc: 'Enhance field photos taken in harsh conditions for impactful fundraising campaigns and annual reports.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your photo', desc: 'Drop any poorly lit, flat, or underexposed image.' },
      { step: '02', title: 'AI analyzes the scene', desc: 'The model assesses lighting, white balance, and color distribution to determine the optimal corrections.' },
      { step: '03', title: 'Download enhanced photo', desc: 'Tone-mapped and color-graded result. Use sliders to fine-tune intensity.' },
    ],
    faq: [
      { q: 'Will it over-enhance my photos?', a: 'The model targets natural-looking results. You can always dial down the intensity with the strength slider.' },
      { q: 'Does it work on RAW files?', a: 'Currently JPG, PNG, WEBP, and TIFF are supported. RAW conversion is on the roadmap.' },
      { q: 'Can I batch-enhance a whole catalog?', a: 'Yes — upload up to 10,000 images in a batch and apply the same enhancement settings across all of them.' },
      { q: 'Does it handle both outdoor and indoor photos?', a: 'Yes — the model adapts its corrections to the scene type automatically.' },
    ],
    stats: [
      { value: '6M+', label: 'Photos enhanced' },
      { value: '4.8/5', label: 'User satisfaction' },
      { value: '0.8s', label: 'Average per image' },
    ],
  },

  {
    slug: 'batch-watermark-remover',
    name: 'Batch Watermark Remover',
    emoji: '📦',
    category: 'image',
    tagline: 'Remove watermarks from thousands of images in one upload.',
    description:
      'Process entire product catalogs, photo libraries, or image archives in a single batch run. Upload up to 10,000 files at once, configure your removal settings once, and let the pipeline handle the rest — results are ready to download as a ZIP or via API.',
    heroTitle: 'Remove Watermarks at Scale',
    heroSubtitle: 'Upload 10,000 images. Download clean results. No manual work.',
    useCases: [
      { icon: '🏭', title: 'E-commerce Brands', desc: 'Process your entire product catalog in one batch — remove supplier watermarks from thousands of SKU images overnight.' },
      { icon: '📂', title: 'Digital Asset Managers', desc: 'Clean up large media libraries acquired from agencies or stock providers, ready for redistribution.' },
      { icon: '🔗', title: 'SaaS Developers', desc: 'Integrate via REST API to add watermark removal to your own product pipeline without building the AI yourself.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload up to 10,000 images', desc: 'Drag a folder or ZIP archive. Supports JPG, PNG, WEBP, AVIF, and TIFF.' },
      { step: '02', title: 'Configure and launch', desc: 'Set removal mode, output format, and naming. Hit run — the distributed pipeline starts processing.' },
      { step: '03', title: 'Download ZIP or use API', desc: 'Results are ready in minutes. Download all at once or pull via REST API with webhook notifications.' },
    ],
    faq: [
      { q: 'How long does a 10,000-image batch take?', a: 'Typically 15–25 minutes for a full batch of 10,000 images, depending on image complexity.' },
      { q: 'Can I mix different watermark types in one batch?', a: 'Yes — the AI auto-detects and handles each watermark style independently per image.' },
      { q: 'Are there API webhooks for batch completion?', a: 'Yes — configure a webhook URL to receive a notification with the download link when your batch finishes.' },
      { q: 'Can I save a batch configuration as a preset?', a: 'Yes — save any batch config as a named preset and reuse it for future uploads.' },
    ],
    stats: [
      { value: '10K', label: 'Images per batch' },
      { value: '15min', label: 'Avg for 10K images' },
      { value: '99.2%', label: 'Batch accuracy' },
    ],
  },

  {
    slug: 'background-remover',
    name: 'Background Remover',
    emoji: '🖼️',
    category: 'image',
    tagline: 'Remove image backgrounds with precision edge detection.',
    description:
      'Separate any subject from its background instantly. Hair strands, fur, transparent glass, and intricate product edges are all handled accurately. Export as transparent PNG, white, black, or any custom hex color for seamless integration into your designs.',
    heroTitle: 'Remove Backgrounds Instantly',
    heroSubtitle: 'Precision edge detection. Transparent PNG, white, or any custom color.',
    useCases: [
      { icon: '📸', title: 'Product Photographers', desc: 'Produce clean, consistent white-background product photos at scale — ready for Amazon, Shopify, or any marketplace.' },
      { icon: '💄', title: 'Beauty & Fashion Brands', desc: 'Isolate models and products for lookbook composites, catalog pages, and social media without a studio retoucher.' },
      { icon: '🎮', title: 'Game & App Developers', desc: 'Cut out assets from reference images or artwork for use in games, UI mockups, or app prototypes.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your image', desc: 'Any subject — people, products, animals, objects. JPG, PNG, WEBP supported.' },
      { step: '02', title: 'AI isolates the subject', desc: 'Edge-aware segmentation separates foreground from background with hair-level precision.' },
      { step: '03', title: 'Choose output background', desc: 'Download as transparent PNG, or pick white, black, or a custom color.' },
    ],
    faq: [
      { q: 'Does it handle fine hair and fur?', a: 'Yes — our model specifically handles difficult edges like hair, fur, and transparent objects accurately.' },
      { q: 'Can I add a new background instead of making it transparent?', a: 'Yes — choose a solid color, gradient, or upload a custom background image.' },
      { q: 'Does it work on group photos with multiple people?', a: 'Yes — multi-subject segmentation is supported. All subjects in the foreground are kept.' },
      { q: 'Can it handle products on glass or reflective surfaces?', a: 'Reflective and semi-transparent objects are handled, though very complex reflections may need manual touch-up.' },
    ],
    stats: [
      { value: '10M+', label: 'Backgrounds removed' },
      { value: '99.6%', label: 'Edge accuracy' },
      { value: '0.7s', label: 'Average per image' },
    ],
  },

  {
    slug: 'magic-eraser',
    name: 'Magic Eraser',
    emoji: '🧹',
    category: 'image',
    tagline: 'Tap to erase distractions. AI fills in the background.',
    description:
      'A precision point-and-erase tool for removing small distractions — pimples, dust spots, power lines, signs, and random clutter. Tap or brush the unwanted element and the AI paints in a seamless replacement using the surrounding context.',
    heroTitle: 'Erase Distractions With One Tap',
    heroSubtitle: 'Point, brush, done. AI inpainting fills every gap naturally.',
    useCases: [
      { icon: '🤳', title: 'Influencers & Creators', desc: 'Remove blemishes, stray hairs, and background clutter from selfies and lifestyle shots before posting.' },
      { icon: '🏗️', title: 'Architects & Interior Designers', desc: 'Clean up construction clutter, cables, and temporary objects from architectural photography renders.' },
      { icon: '🔬', title: 'Scientists & Academics', desc: 'Remove dust particles, lens artifacts, and equipment from microscopy or field photography for publication.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your image', desc: 'JPG, PNG, or WEBP. Any resolution.' },
      { step: '02', title: 'Brush the distraction', desc: 'Use the eraser brush to paint over anything you want gone. Large or small — it adapts.' },
      { step: '03', title: 'AI fills seamlessly', desc: 'Context-aware inpainting generates the background in real time. Undo and retry in one click.' },
    ],
    faq: [
      { q: 'How small can the objects be?', a: 'There is no minimum size. The magic eraser handles everything from single pixels to large objects.' },
      { q: 'Can I erase multiple things in one session?', a: 'Yes — keep brushing different areas in the same edit session before downloading.' },
      { q: 'What if the fill does not look right?', a: 'Hit the regenerate button to get a new AI fill variant for the same selection.' },
      { q: 'Does it work on portrait shots for skin retouching?', a: 'Yes — it is commonly used for blemish removal and minor skin retouching on portraits.' },
    ],
    stats: [
      { value: '7M+', label: 'Objects erased' },
      { value: '98.3%', label: 'Seamless fill rate' },
      { value: '0.5s', label: 'Average per erase' },
    ],
  },

  {
    slug: 'gif-watermark-remover',
    name: 'GIF Watermark Remover',
    emoji: '🎬',
    category: 'image',
    tagline: 'Strip watermarks from animated GIFs frame by frame.',
    description:
      'Remove watermarks, logos, and text overlays from animated GIFs without breaking the animation. The AI processes each frame in parallel, applies consistent removal across the timeline, and reassembles the animation at the original frame rate and palette.',
    heroTitle: 'Remove Watermarks From GIFs',
    heroSubtitle: 'Frame-perfect removal. Animation timing and loop count preserved.',
    useCases: [
      { icon: '💬', title: 'Chat & Community Managers', desc: 'Remove attribution watermarks from GIF reactions and stickers for use in branded Slack workspaces or Discord servers.' },
      { icon: '📣', title: 'Marketing Teams', desc: 'Clean up animated GIF banners and promotional assets acquired from design agencies before embedding in campaigns.' },
      { icon: '🎓', title: 'Educators', desc: 'Remove watermarks from animated diagrams and educational GIFs to use freely in course materials and presentations.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your GIF', desc: 'Drop any animated GIF up to 50 MB. All frame rates and loop modes supported.' },
      { step: '02', title: 'AI removes per frame', desc: 'Each frame is processed individually with consistent masking to ensure the removal looks stable throughout the animation.' },
      { step: '03', title: 'Download clean GIF', desc: 'Reassembled at original frame rate, palette, and loop count. No quality loss.' },
    ],
    faq: [
      { q: 'Does the animation loop and timing stay the same?', a: 'Yes — frame delays, loop count, and playback timing are preserved exactly.' },
      { q: 'What is the maximum GIF size?', a: 'Up to 50 MB. For very large GIFs we recommend splitting them first.' },
      { q: 'Does it handle GIFs with semi-transparent backgrounds?', a: 'Yes — the model handles GIF transparency correctly and does not destroy the alpha channel.' },
      { q: 'Can it remove animated watermarks that move across frames?', a: 'Yes — moving watermarks are detected per-frame so even traveling text or logos are removed consistently.' },
    ],
    stats: [
      { value: '900K+', label: 'GIFs processed' },
      { value: '99.0%', label: 'Animation preserved' },
      { value: '4.1s', label: 'Average per GIF' },
    ],
  },

  {
    slug: 'remove-logo',
    name: 'Remove Logo',
    emoji: '🚫',
    category: 'image',
    tagline: 'Erase brand logos and icons from photos automatically.',
    description:
      'Detect and remove logos, brand marks, icons, and emblems from photos with AI. Whether it is a small corner brand mark, a sponsor logo on clothing, or a large overlay, the AI identifies the logo region and inpaints the scene naturally.',
    heroTitle: 'Remove Logos From Photos',
    heroSubtitle: 'AI identifies brand marks and erases them seamlessly.',
    useCases: [
      { icon: '👔', title: 'Apparel Designers', desc: 'Remove competitor brand logos from reference garment photos when creating mood boards and technical design briefs.' },
      { icon: '📡', title: 'Media & Broadcasting', desc: 'Strip watermark logos from broadcast-capture stills for archival or editorial reuse.' },
      { icon: '🏋️', title: 'Sports & Fitness Coaches', desc: 'Remove gear sponsor logos from workout demo photos before publishing in neutral branded training content.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload the photo', desc: 'Any image with a logo overlay or embedded brand mark.' },
      { step: '02', title: 'AI detects the logo', desc: 'Logo detection runs automatically. Manually mark any logos it misses.' },
      { step: '03', title: 'Download logo-free result', desc: 'The scene behind the logo is reconstructed. Download at original resolution.' },
    ],
    faq: [
      { q: 'Does it work on small corner watermarks?', a: 'Yes — small corner logos are one of the most common cases and are handled reliably.' },
      { q: 'What about embroidered logos on clothing?', a: 'The AI handles logos on clothing but embroidered or printed-into-fabric logos will show the underlying fabric texture, which may not be perfectly smooth.' },
      { q: 'Can it detect logos it has never seen before?', a: 'Yes — it detects logos by visual region, not by a logo database, so any brand mark is handled.' },
      { q: 'Is there a limit to the number of logos per image?', a: 'No hard limit. Multiple logos across a single image are all removed in one pass.' },
    ],
    stats: [
      { value: '3.5M+', label: 'Logos removed' },
      { value: '98.7%', label: 'Clean removal rate' },
      { value: '1.4s', label: 'Average per image' },
    ],
  },

  {
    slug: 'add-watermark',
    name: 'Add Watermark',
    emoji: '💧',
    category: 'image',
    tagline: 'Protect your images by adding custom watermarks in bulk.',
    description:
      'Apply text or logo watermarks to any number of images in a single batch. Control opacity, position, font, size, and rotation. Export ready-to-publish images with your brand identity embedded — perfect for photographers protecting their portfolios.',
    heroTitle: 'Protect Your Photos With Watermarks',
    heroSubtitle: 'Bulk watermarking with full control over style, position, and opacity.',
    useCases: [
      { icon: '📷', title: 'Photographers', desc: 'Batch-watermark client proof galleries before delivery so your brand is protected until the final payment is made.' },
      { icon: '🎨', title: 'Digital Artists', desc: 'Protect artwork shared on social media or portfolio sites with a subtle, custom-designed watermark.' },
      { icon: '📰', title: 'News Publishers', desc: 'Stamp all editorial images with your publication logo before distributing to partner outlets and wire services.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your images', desc: 'Drop up to 10,000 images or a full folder. All formats supported.' },
      { step: '02', title: 'Design your watermark', desc: 'Type custom text or upload your logo. Set position, opacity, size, and rotation.' },
      { step: '03', title: 'Download watermarked batch', desc: 'All images watermarked consistently. Download as ZIP or via API.' },
    ],
    faq: [
      { q: 'Can I use my own logo as a watermark?', a: 'Yes — upload any PNG logo with transparency and position it anywhere on the image.' },
      { q: 'Can the watermark be tiled across the whole image?', a: 'Yes — choose tiled mode to repeat the watermark across the entire image for maximum protection.' },
      { q: 'Does it support custom fonts?', a: 'Yes — upload any TTF or OTF font file to use your brand typeface.' },
      { q: 'Can I save a watermark template for reuse?', a: 'Yes — save any configuration as a named template and load it instantly for future batches.' },
    ],
    stats: [
      { value: '4M+', label: 'Images watermarked' },
      { value: '100%', label: 'Batch consistency' },
      { value: '0.3s', label: 'Average per image' },
    ],
  },

  {
    slug: 'image-upscaler',
    name: 'Image Upscaler',
    emoji: '📐',
    category: 'image',
    tagline: 'Upscale images 2x or 4x with AI detail enhancement.',
    description:
      'Enlarge images to 2× or 4× their original resolution using a generative upscaling model that hallucinates fine detail — texture, sharpness, and micro-contrast — rather than simply interpolating pixels. Export at up to 300 DPI for print-ready use.',
    heroTitle: 'Upscale Images to 4× Resolution',
    heroSubtitle: 'AI generates fine detail — not blurry upsampling. Print-ready at 300 DPI.',
    useCases: [
      { icon: '🖨️', title: 'Print Designers', desc: 'Upscale web-resolution images for large-format print without pixelation — posters, banners, and signage ready at 300 DPI.' },
      { icon: '🕹️', title: 'Game Developers', desc: 'Upscale low-res texture assets or retro sprites for use in HD game remasters and high-DPI displays.' },
      { icon: '🏛️', title: 'Museums & Archives', desc: 'Enhance historical photographs and archival images for modern digital display or publication reproduction.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your image', desc: 'Any JPG, PNG, WEBP, or TIFF. Works best on images at least 100×100 px.' },
      { step: '02', title: 'Choose upscale factor', desc: 'Select 2× or 4×. Enable texture mode for fabric, leather, or complex surfaces.' },
      { step: '03', title: 'Download high-res result', desc: 'Download as PNG, TIFF, or WEBP at up to 300 DPI. Original quality preserved.' },
    ],
    faq: [
      { q: 'What is the maximum output resolution?', a: 'With 4× upscaling you can reach up to 16,000×16,000 px depending on input size.' },
      { q: 'Does it work on cartoons and illustrations?', a: 'Yes — there is a dedicated illustration mode that preserves crisp lines and flat colors.' },
      { q: 'Can I upscale blurry images?', a: 'Run Unblur Image first, then Upscaler for best results on blurry photos.' },
      { q: 'Is there a batch upscale option?', a: 'Yes — process up to 5,000 images per batch in upscale mode.' },
    ],
    stats: [
      { value: '2M+', label: 'Images upscaled' },
      { value: '4×', label: 'Max resolution boost' },
      { value: '2.4s', label: 'Average per image' },
    ],
  },

  // ── VIDEO TOOLS ──────────────────────────────────────────────────────────────

  {
    slug: 'video-watermark-remover',
    name: 'Video Watermark Remover',
    emoji: '🎥',
    category: 'video',
    tagline: 'Remove watermarks from videos frame by frame with AI.',
    description:
      'Erase static or animated watermarks, channel bugs, and logo overlays from any video file. The AI processes each frame with temporal consistency so the removal is stable across the entire timeline — no flickering, no artifacts, even on moving scenes.',
    heroTitle: 'Remove Watermarks From Videos',
    heroSubtitle: 'Frame-consistent AI removal. No flickering. No artifacts.',
    useCases: [
      { icon: '📺', title: 'Video Editors', desc: 'Remove channel watermarks and broadcast bugs from archival footage before re-editing for new productions.' },
      { icon: '🎓', title: 'Online Course Creators', desc: 'Strip stock video preview watermarks from clips being evaluated for use in course modules before purchasing.' },
      { icon: '📱', title: 'Social Media Teams', desc: 'Clean up user-generated content or repurposed clips that carry third-party platform watermarks.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your video', desc: 'Supports MP4, MOV, MKV, and AVI up to 2 GB. Up to 4K resolution.' },
      { step: '02', title: 'AI detects the watermark', desc: 'The model identifies the static or animated watermark region and builds a frame-consistent removal mask.' },
      { step: '03', title: 'Download clean video', desc: 'Watermark-free video exported at original resolution and frame rate. Choose H.264, H.265, or VP9.' },
    ],
    faq: [
      { q: 'Does it handle animated or moving watermarks?', a: 'Yes — moving watermarks are tracked across frames and removed consistently throughout the video.' },
      { q: 'What video formats are supported?', a: 'MP4 (H.264/H.265), MOV, MKV, AVI, and WEBM. Output is available in H.264, H.265, and VP9.' },
      { q: 'Will the video quality degrade?', a: 'We use lossless intermediate processing with configurable output bitrate so quality loss is minimal.' },
      { q: 'How long does a 10-minute video take?', a: 'A 10-minute 1080p video typically processes in 3–7 minutes depending on scene complexity.' },
    ],
    stats: [
      { value: '500K+', label: 'Videos processed' },
      { value: '98.9%', label: 'Frame consistency' },
      { value: '3min', label: 'Avg for 10-min video' },
    ],
  },

  {
    slug: 'video-text-remover',
    name: 'Video Text Remover',
    emoji: '📝',
    category: 'video',
    tagline: 'Erase burned-in text and captions from video footage.',
    description:
      'Remove burned-in text overlays, lower thirds, titles, and hardcoded captions from video files. The AI detects text regions frame by frame and reconstructs the scene behind them using temporal inpainting, producing a clean, text-free result.',
    heroTitle: 'Remove Text Overlays From Video',
    heroSubtitle: 'Titles, lower-thirds, captions — erased without reshot footage.',
    useCases: [
      { icon: '🎬', title: 'Film & TV Post-Production', desc: 'Remove temporary title cards and burned-in production notes from editorial cuts being shared with clients.' },
      { icon: '🌐', title: 'Localization Teams', desc: 'Strip hardcoded captions from source video so new language subtitles can be added cleanly.' },
      { icon: '📊', title: 'Corporate Communications', desc: 'Remove old date stamps, department labels, and lower-third graphics from internal training videos being repurposed.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload the video', desc: 'Supports MP4, MOV, MKV up to 2 GB.' },
      { step: '02', title: 'AI detects text regions', desc: 'Video OCR scans every frame and generates a per-frame text mask.' },
      { step: '03', title: 'Download text-free video', desc: 'Temporal inpainting fills each frame. Export at original resolution.' },
    ],
    faq: [
      { q: 'Can it remove scrolling news tickers?', a: 'Yes — moving text regions are tracked across frames and removed with temporal consistency.' },
      { q: 'Does it affect non-text parts of the video?', a: 'No — only the detected text regions are inpainted. The rest of the video is untouched.' },
      { q: 'Can I use it to remove SRT-burned subtitles?', a: 'Yes — hardcoded subtitle removal is the most common use case for this tool.' },
      { q: 'What resolution is supported?', a: 'Up to 4K (3840×2160). Higher resolutions may require the Enterprise plan.' },
    ],
    stats: [
      { value: '350K+', label: 'Videos cleaned' },
      { value: '97.4%', label: 'Text removal accuracy' },
      { value: '4min', label: 'Avg for 10-min video' },
    ],
  },

  {
    slug: 'unblur-video',
    name: 'Unblur Video',
    emoji: '🔭',
    category: 'video',
    tagline: 'Sharpen blurry video footage with temporal AI processing.',
    description:
      'Apply frame-by-frame deblurring to motion-blurred or defocused video clips. The model uses temporal context from adjacent frames to produce stable, flicker-free sharpening across the entire video — far superior to per-frame sharpening filters.',
    heroTitle: 'Sharpen Blurry Video Footage',
    heroSubtitle: 'Temporal AI deblurring. Stable sharpness across every frame.',
    useCases: [
      { icon: '🚓', title: 'Law Enforcement & Security', desc: 'Enhance blurry CCTV or dashcam footage to improve license plate and facial detail legibility for investigations.' },
      { icon: '🎥', title: 'Documentary Filmmakers', desc: 'Rescue valuable archival or field footage that was shot out of focus or with excessive motion blur.' },
      { icon: '🏈', title: 'Sports Analysts', desc: 'Sharpen fast-motion sports footage for clearer frame-by-frame playback and analysis.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload blurry video', desc: 'MP4, MOV, or MKV up to 2 GB. Works on motion blur and defocus.' },
      { step: '02', title: 'Select sharpening mode', desc: 'Choose between Motion Deblur, Defocus Fix, or Auto-Detect.' },
      { step: '03', title: 'Download sharpened video', desc: 'Temporally consistent sharpening applied across all frames. No flicker.' },
    ],
    faq: [
      { q: 'Does it cause flickering between frames?', a: 'No — temporal processing ensures consistency between adjacent frames, preventing flicker.' },
      { q: 'Can it sharpen low-light blurry footage?', a: 'Yes — the model combines deblurring with noise reduction for low-light video.' },
      { q: 'What frame rates are supported?', a: 'Up to 120fps. High-speed slow-motion footage is fully supported.' },
      { q: 'Will it fix severely blurry footage?', a: 'Moderate blur is fixed very well. Extreme blur may show residual softness but will still be improved significantly.' },
    ],
    stats: [
      { value: '200K+', label: 'Videos sharpened' },
      { value: '95.1%', label: 'Perceived clarity gain' },
      { value: '5min', label: 'Avg for 10-min video' },
    ],
  },

  {
    slug: 'video-subtitles-remover',
    name: 'Video Subtitles Remover',
    emoji: '💬',
    category: 'video',
    tagline: 'Remove hardcoded subtitles from any video file.',
    description:
      'Strip hardcoded SRT, ASS, or burned-in caption text from video without damaging the underlying scene. Ideal for localization workflows where you need a clean video track to overlay professional subtitles in a different language.',
    heroTitle: 'Remove Hardcoded Subtitles From Video',
    heroSubtitle: 'Clean slate for your localization workflow. Supports all subtitle formats.',
    useCases: [
      { icon: '🌍', title: 'Localization Studios', desc: 'Get a subtitle-free master video to hand off to translators and subtitle studios for professional language versions.' },
      { icon: '🎙️', title: 'Podcast & YouTube Producers', desc: 'Remove auto-generated burned-in captions from older episodes before re-encoding with corrected subtitle files.' },
      { icon: '🏢', title: 'HR & Training Teams', desc: 'Strip outdated subtitles from internal training videos to add updated accessibility captions.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload the video', desc: 'MP4, MOV, MKV, or AVI. Up to 2 GB.' },
      { step: '02', title: 'AI locates subtitle band', desc: 'The model identifies the subtitle region at the bottom (or top) of the frame consistently across all scenes.' },
      { step: '03', title: 'Download subtitle-free video', desc: 'Scene reconstructed behind the subtitle text. Export at original quality.' },
    ],
    faq: [
      { q: 'Does it also remove subtitles that appear in the middle of the frame?', a: 'Yes — although most subtitles are at the bottom, the model handles any position.' },
      { q: 'Can it remove subtitles in any language?', a: 'Yes — the model works on visual pattern detection regardless of language.' },
      { q: 'What if subtitles overlap a complex background?', a: 'Complex backgrounds behind subtitles may show minor reconstruction artifacts. The quality is generally very good.' },
      { q: 'Does it affect audio?', a: 'No — the audio track is passed through untouched.' },
    ],
    stats: [
      { value: '420K+', label: 'Videos processed' },
      { value: '98.5%', label: 'Subtitle removal rate' },
      { value: '3.5min', label: 'Avg for 10-min video' },
    ],
  },

  {
    slug: 'video-enhancer',
    name: 'Video Enhancer',
    emoji: '✨',
    category: 'video',
    tagline: 'Auto-enhance color, exposure, and detail across your entire video.',
    description:
      'Intelligently remaster video footage with AI-driven tone mapping, color grading, and detail enhancement. The model analyzes each scene and applies shot-adaptive corrections — no manual keyframing, no LUTs, no color grading experience required.',
    heroTitle: 'Remaster Video With One Click',
    heroSubtitle: 'Scene-adaptive AI color grade. No LUTs or keyframes needed.',
    useCases: [
      { icon: '🎞️', title: 'Videographers', desc: 'Quickly color grade event and wedding footage without spending hours in DaVinci Resolve.' },
      { icon: '📹', title: 'Content Creators', desc: 'Boost the visual quality of smartphone or budget camera footage to match professional broadcast standards.' },
      { icon: '🏠', title: 'Real Estate Video Tours', desc: 'Enhance poorly lit interior walk-through videos for premium listing presentation without a reshoot.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload your video', desc: 'MP4, MOV, or MKV up to 2 GB. Supports up to 4K.' },
      { step: '02', title: 'AI grades scene by scene', desc: 'Shot detection + adaptive color grading ensures consistent, natural-looking enhancement.' },
      { step: '03', title: 'Download enhanced video', desc: 'Color-graded and detail-enhanced. Choose your export codec and bitrate.' },
    ],
    faq: [
      { q: 'Does it change the look dramatically or subtly?', a: 'By default the enhancement is natural. Use the intensity slider to choose between subtle correction and cinematic grade.' },
      { q: 'Will colors shift between shots?', a: 'Shot detection ensures each scene is graded independently so you do not get jarring color jumps between cuts.' },
      { q: 'Can I apply a specific visual style?', a: 'Yes — preset styles include Cinematic, Natural, Vibrant, and Low-Key. Custom LUT import is available on Pro.' },
      { q: 'Does it enhance audio too?', a: 'Video enhancement only. Use a dedicated audio tool for voice and music enhancement.' },
    ],
    stats: [
      { value: '300K+', label: 'Videos enhanced' },
      { value: '4.7/5', label: 'Creator satisfaction' },
      { value: '4min', label: 'Avg for 10-min video' },
    ],
  },

  {
    slug: 'video-upscaler',
    name: 'Video Upscaler',
    emoji: '📐',
    category: 'video',
    tagline: 'Upscale SD and HD video to 4K with AI detail generation.',
    description:
      'Enlarge video from 480p or 720p to 1080p or 4K using a temporal super-resolution model that generates consistent fine detail across frames. Ideal for breathing new life into old archive footage, retro content, and user-generated low-res video.',
    heroTitle: 'Upscale Video to 4K With AI',
    heroSubtitle: 'Temporal super-resolution. Stable detail generation across every frame.',
    useCases: [
      { icon: '📼', title: 'Video Archivists', desc: 'Upscale VHS-digitized or early-digital footage to HD or 4K for modern streaming platforms and digital archives.' },
      { icon: '🕹️', title: 'Game Streamers & Recorders', desc: 'Enhance old gameplay recordings captured at low resolution for YouTube upload or portfolio presentation.' },
      { icon: '📡', title: 'Broadcast Remastering', desc: 'Upscale legacy SD broadcast content for HD re-release on streaming services or anniversary editions.' },
    ],
    howItWorks: [
      { step: '01', title: 'Upload low-res video', desc: 'MP4, MOV, MKV up to 2 GB. Works from 240p up to 1080p input.' },
      { step: '02', title: 'Choose target resolution', desc: 'Select 2×, 1080p, or 4K as the output target.' },
      { step: '03', title: 'Download upscaled video', desc: 'AI-enhanced video at target resolution. Export as H.264 or H.265.' },
    ],
    faq: [
      { q: 'Does it flicker or produce unstable detail?', a: 'No — temporal consistency is a core design goal. The model uses neighboring frames to keep detail stable.' },
      { q: 'Can it upscale video from VHS or tape captures?', a: 'Yes — VHS and tape digitizations are well-supported. Noise reduction runs automatically for tape sources.' },
      { q: 'Is 4K output available on all plans?', a: '4K upscaling is available on Pro and Enterprise plans. Free plan supports up to 1080p output.' },
      { q: 'How long does it take to upscale a 1-hour video?', a: 'A 1-hour 1080p-to-4K upscale typically takes 25–40 minutes on our distributed infrastructure.' },
    ],
    stats: [
      { value: '180K+', label: 'Videos upscaled' },
      { value: '4K', label: 'Maximum output' },
      { value: '8min', label: 'Avg for 10-min video' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((t) => t.slug === slug)
}

export const IMAGE_TOOLS = ALL_TOOLS.filter((t) => t.category === 'image')
export const VIDEO_TOOLS  = ALL_TOOLS.filter((t) => t.category === 'video')
