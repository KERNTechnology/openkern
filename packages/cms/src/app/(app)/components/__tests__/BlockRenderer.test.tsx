import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BlockRenderer } from "../BlockRenderer";
import type { ThemeComponents } from "@/themes/types";

afterEach(() => cleanup());

// ── Mock the RichText component (heavy Payload dependency) ─────────────────

vi.mock("@payloadcms/richtext-lexical/react", () => ({
  RichText: ({ data }: { data: unknown }) => (
    <div data-testid="richtext">{JSON.stringify(data)}</div>
  ),
}));

// ── Stub theme components ──────────────────────────────────────────────────

function stubComponent(name: string) {
  const Component = (props: Record<string, unknown>) => (
    <div data-testid={`theme-${name}`} data-props={JSON.stringify(props)}>
      {name}
    </div>
  );
  Component.displayName = name;
  return Component;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockComponents: ThemeComponents = {
  Header: stubComponent("Header") as any,
  Footer: stubComponent("Footer") as any,
  Hero: stubComponent("Hero") as any,
  Services: stubComponent("Services") as any,
  Portfolio: stubComponent("Portfolio") as any,
  Testimonials: stubComponent("Testimonials") as any,
  CTA: stubComponent("CTA") as any,
  BlogCard: stubComponent("BlogCard") as any,
  PageLayout: stubComponent("PageLayout") as any,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("BlockRenderer", () => {
  it("renders nothing for empty blocks array", () => {
    const { container } = render(
      <BlockRenderer blocks={[]} components={mockComponents} />,
    );
    expect(container.querySelector("main")?.children).toHaveLength(0);
  });

  it("renders a hero block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "hero",
            headline: "Welcome",
            subheadline: "To our site",
            primaryCta: { label: "Start", url: "/" },
          },
        ]}
        components={mockComponents}
      />,
    );
    const hero = screen.getByTestId("theme-Hero");
    expect(hero).toBeDefined();
    const props = JSON.parse(hero.getAttribute("data-props") || "{}");
    expect(props.headline).toBe("Welcome");
    expect(props.subheadline).toBe("To our site");
    expect(props.primaryCta).toEqual({ label: "Start", url: "/" });
  });

  it("renders a services block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "services",
            headline: "Our Services",
            services: [
              { title: "Web Dev", description: "We build sites", icon: "code" },
            ],
          },
        ]}
        components={mockComponents}
      />,
    );
    const services = screen.getByTestId("theme-Services");
    const props = JSON.parse(services.getAttribute("data-props") || "{}");
    expect(props.headline).toBe("Our Services");
    expect(props.services).toHaveLength(1);
    expect(props.services[0].title).toBe("Web Dev");
  });

  it("renders a portfolio block with media resolution", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "portfolio",
            headline: "Work",
            items: [
              {
                title: "Project A",
                description: "A project",
                image: { url: "/media/project-a.jpg", alt: "Project A" },
                url: "https://example.com",
              },
            ],
          },
        ]}
        components={mockComponents}
      />,
    );
    const portfolio = screen.getByTestId("theme-Portfolio");
    const props = JSON.parse(portfolio.getAttribute("data-props") || "{}");
    expect(props.items[0].image).toEqual({
      url: "/media/project-a.jpg",
      alt: "Project A",
    });
  });

  it("resolves media with missing alt to empty string", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "portfolio",
            headline: "Work",
            items: [{ title: "P", image: { url: "/img.jpg" } }],
          },
        ]}
        components={mockComponents}
      />,
    );
    const portfolio = screen.getByTestId("theme-Portfolio");
    const props = JSON.parse(portfolio.getAttribute("data-props") || "{}");
    expect(props.items[0].image.alt).toBe("");
  });

  it("resolves numeric media IDs to null", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "portfolio",
            headline: "Work",
            items: [{ title: "P", image: 42 }],
          },
        ]}
        components={mockComponents}
      />,
    );
    const portfolio = screen.getByTestId("theme-Portfolio");
    const props = JSON.parse(portfolio.getAttribute("data-props") || "{}");
    expect(props.items[0].image).toBeNull();
  });

  it("renders a testimonials block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "testimonials",
            headline: "Reviews",
            testimonials: [
              { quote: "Great!", author: "Jane", role: "CEO", company: "Corp" },
            ],
          },
        ]}
        components={mockComponents}
      />,
    );
    const testimonials = screen.getByTestId("theme-Testimonials");
    const props = JSON.parse(testimonials.getAttribute("data-props") || "{}");
    expect(props.testimonials[0].author).toBe("Jane");
  });

  it("renders a CTA block", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "cta",
            headline: "Get Started",
            description: "Try now",
            buttonLabel: "Sign Up",
            buttonUrl: "/register",
          },
        ]}
        components={mockComponents}
      />,
    );
    const cta = screen.getByTestId("theme-CTA");
    const props = JSON.parse(cta.getAttribute("data-props") || "{}");
    expect(props.buttonLabel).toBe("Sign Up");
    expect(props.buttonUrl).toBe("/register");
  });

  it("renders a richtext block", () => {
    const richContent = { root: { children: [{ type: "paragraph" }] } };
    render(
      <BlockRenderer
        blocks={[{ blockType: "richtext", content: richContent }]}
        components={mockComponents}
      />,
    );
    expect(screen.getByTestId("richtext")).toBeDefined();
  });

  it("skips unknown block types", () => {
    const { container } = render(
      <BlockRenderer
        blocks={[{ blockType: "unknown-block" }]}
        components={mockComponents}
      />,
    );
    // main should have no visible children (null is rendered)
    const children = container.querySelector("main")?.children;
    expect(children).toHaveLength(0);
  });

  it("renders multiple blocks in order", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            blockType: "hero",
            headline: "First",
            primaryCta: { label: "Go", url: "/" },
          },
          {
            blockType: "services",
            headline: "Second",
            services: [],
          },
          {
            blockType: "cta",
            headline: "Third",
            buttonLabel: "Click",
            buttonUrl: "/",
          },
        ]}
        components={mockComponents}
      />,
    );
    expect(screen.getByTestId("theme-Hero")).toBeDefined();
    expect(screen.getByTestId("theme-Services")).toBeDefined();
    expect(screen.getByTestId("theme-CTA")).toBeDefined();
  });

  it("provides default values for missing hero fields", () => {
    render(
      <BlockRenderer
        blocks={[{ blockType: "hero" }]}
        components={mockComponents}
      />,
    );
    const hero = screen.getByTestId("theme-Hero");
    const props = JSON.parse(hero.getAttribute("data-props") || "{}");
    expect(props.headline).toBe("");
    expect(props.primaryCta).toEqual({ label: "", url: "/" });
  });

  it("provides empty array for missing services", () => {
    render(
      <BlockRenderer
        blocks={[{ blockType: "services" }]}
        components={mockComponents}
      />,
    );
    const services = screen.getByTestId("theme-Services");
    const props = JSON.parse(services.getAttribute("data-props") || "{}");
    expect(props.services).toEqual([]);
  });
});
