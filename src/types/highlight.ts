export interface Highlight {
  id: string
  pageNumber: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
    pageHeight: number
    pageWidth: number
  }
  color: string
  text: string
  note?: string
  createdAt?: string
}
