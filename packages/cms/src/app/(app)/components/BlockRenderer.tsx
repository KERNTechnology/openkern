import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { ThemeComponents } from '@/themes/types'

interface Block {
  blockType: string
  [key: string]: unknown
}

interface Props {
  blocks: Block[]
  components: ThemeComponents
}

/** Resolve a Payload media relation (populated object or numeric ID) to a simple { url, alt } shape. */
function resolveMedia(
  field: { url?: string; alt?: string; filename?: string } | number | null | undefined,
): { url: string; alt: string } | null {
  if (!field || typeof field === 'number') return null
  if (!field.url) return null
  return { url: field.url, alt: field.alt || '' }
}

export function BlockRenderer({ blocks, components }: Props) {
  const { Hero, Services, Portfolio, Testimonials, CTA } = components

  return (
    <main>
      {blocks.map((block, i) => {
        const key = (block.id as string) ?? `${block.blockType}-${i}`

        switch (block.blockType) {
          case 'hero':
            return (
              <Hero
                key={key}
                headline={(block.headline as string) || ''}
                subheadline={block.subheadline as string | undefined}
                primaryCta={
                  (block.primaryCta as { label: string; url: string }) || {
                    label: '',
                    url: '/',
                  }
                }
                secondaryCta={
                  block.secondaryCta as
                    | { label?: string | null; url?: string | null }
                    | undefined
                }
                backgroundImage={
                  resolveMedia(
                    block.backgroundImage as
                      | { url?: string; alt?: string }
                      | null
                      | undefined,
                  )
                }
              />
            )

          case 'services':
            return (
              <Services
                key={key}
                headline={(block.headline as string) || ''}
                subheadline={block.subheadline as string | undefined}
                services={
                  (block.services as Array<{
                    title: string
                    description: string
                    icon?: string | null
                  }>) || []
                }
              />
            )

          case 'portfolio':
            return (
              <Portfolio
                key={key}
                headline={(block.headline as string) || ''}
                subheadline={block.subheadline as string | undefined}
                items={(
                  (block.items as Array<Record<string, unknown>>) || []
                ).map((item) => ({
                  title: (item.title as string) || '',
                  description: item.description as string | undefined,
                  image: resolveMedia(
                    item.image as { url?: string; alt?: string } | null,
                  ),
                  url: item.url as string | undefined,
                }))}
              />
            )

          case 'testimonials':
            return (
              <Testimonials
                key={key}
                headline={(block.headline as string) || ''}
                testimonials={
                  (block.testimonials as Array<{
                    quote: string
                    author: string
                    role?: string | null
                    company?: string | null
                  }>) || []
                }
              />
            )

          case 'cta':
            return (
              <CTA
                key={key}
                headline={(block.headline as string) || ''}
                description={block.description as string | undefined}
                buttonLabel={(block.buttonLabel as string) || ''}
                buttonUrl={(block.buttonUrl as string) || '/'}
              />
            )

          case 'richtext':
            return (
              <section key={key} className="t-section">
                <div className="t-section__content rich-text">
                  {block.content ? <RichText data={block.content as SerializedEditorState} /> : null}
                </div>
              </section>
            )

          default:
            return null
        }
      })}
    </main>
  )
}
