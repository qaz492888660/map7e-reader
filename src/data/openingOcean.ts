type OceanOpeningMedia = {
  workshopId: string
  title: string
  wallpaperAuthor: string
  originalArtist: string
  websiteUseApproved: boolean
  originalFileVerified: boolean
  // Only set after the original file and written website permission are checked.
  videoSrc?: string
  posterSrc?: string
}

export const oceanOpeningMedia: OceanOpeningMedia = {
  workshopId: '1864604777',
  title: '鲸与海',
  wallpaperAuthor: '大污师！',
  originalArtist: '韩一杰',
  websiteUseApproved: false,
  originalFileVerified: false,
}

export function openingMediaSources() {
  if (oceanOpeningMedia.websiteUseApproved && oceanOpeningMedia.originalFileVerified && oceanOpeningMedia.videoSrc) {
    return {
      videoSrc: oceanOpeningMedia.videoSrc,
      posterSrc: oceanOpeningMedia.posterSrc,
    }
  }
  // Private review only. Vite removes this branch from production builds.
  // Do not copy unlicensed review media into public/ or the Git repository.
  if (import.meta.env.DEV) {
    return {
      videoSrc: import.meta.env.VITE_OPENING_REVIEW_VIDEO || undefined,
      posterSrc: import.meta.env.VITE_OPENING_REVIEW_POSTER || undefined,
    }
  }
  return { videoSrc: undefined, posterSrc: undefined }
}
