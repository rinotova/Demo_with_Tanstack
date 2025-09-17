import { useMemo } from 'react'
import { projects, type Project } from '../data/projects'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  slug?: string | null
}

export default function ProjectPreviewDialog({ open, onOpenChange, slug }: Props) {
  const proj: Project | undefined = useMemo(
    () => (slug ? projects.find((p) => p.slug === slug) : projects[0]),
    [slug],
  )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{proj?.name ?? 'Project'}</DialogTitle>
          <DialogDescription>{proj?.description}</DialogDescription>
        </DialogHeader>
        {proj?.url ? (
          <a
            href={proj.url}
            target="_blank"
            rel="noreferrer"
            className="text-[#4fc1ff] hover:underline text-sm"
          >
            Open repository
          </a>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

