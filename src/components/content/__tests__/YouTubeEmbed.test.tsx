import React from "react";
import { render, screen } from "@testing-library/react";
import { YouTubeEmbed, YouTubeThumbnail } from "../YouTubeEmbed";

describe("YouTubeEmbed", () => {
  it("should render iframe with valid video ID", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain("youtube.com/embed/dQw4w9WgXcQ");
  });

  it("should show invalid message for bad video ID", () => {
    render(<YouTubeEmbed videoId="bad" />);
    expect(screen.getByText("Invalid video ID")).toBeInTheDocument();
  });

  it("should include title in iframe when provided", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" title="My Video" />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.title).toBe("My Video");
  });

  it("should render title heading when provided", () => {
    render(<YouTubeEmbed videoId="dQw4w9WgXcQ" title="My Video" />);
    expect(screen.getByText("My Video")).toBeInTheDocument();
  });

  it("should use default title when none provided", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.title).toBe("YouTube video player");
  });

  it("should include start time in URL", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" startTime={30} />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.src).toContain("start=30");
  });

  it("should disable controls when showControls is false", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" showControls={false} />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.src).toContain("controls=0");
  });

  it("should use 16:9 aspect ratio by default", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    const wrapper = container.querySelector(".aspect-video");
    expect(wrapper).toBeTruthy();
  });

  it("should support 4:3 aspect ratio", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="4:3" />);
    expect(container.querySelector(".aspect-\\[4\\/3\\]")).toBeTruthy();
  });

  it("should support 1:1 aspect ratio", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="1:1" />);
    expect(container.querySelector(".aspect-square")).toBeTruthy();
  });

  it("should set lazy loading on iframe", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" />);
    expect(container.querySelector("iframe")?.getAttribute("loading")).toBe("lazy");
  });

  it("should apply custom className", () => {
    const { container } = render(<YouTubeEmbed videoId="dQw4w9WgXcQ" className="my-class" />);
    expect(container.firstChild).toHaveClass("my-class");
  });
});

describe("YouTubeThumbnail", () => {
  it("should render thumbnail image with correct URL", () => {
    const { container } = render(<YouTubeThumbnail videoId="abc12345678" />);
    const img = container.querySelector("img");
    expect(img?.src).toContain("img.youtube.com/vi/abc12345678/hqdefault.jpg");
  });

  it("should use specified quality", () => {
    const { container } = render(<YouTubeThumbnail videoId="abc12345678" quality="maxres" />);
    const img = container.querySelector("img");
    expect(img?.src).toContain("maxresdefault.jpg");
  });

  it("should set alt text", () => {
    const { container } = render(<YouTubeThumbnail videoId="abc12345678" alt="My thumbnail" />);
    expect(container.querySelector("img")?.alt).toBe("My thumbnail");
  });

  it("should call onClick when clicked", () => {
    const onClick = jest.fn();
    const { container } = render(<YouTubeThumbnail videoId="abc12345678" onClick={onClick} />);
    const wrapper = container.firstChild as HTMLElement;
    wrapper.click();
    expect(onClick).toHaveBeenCalled();
  });

  it("should render play button overlay", () => {
    const { container } = render(<YouTubeThumbnail videoId="abc12345678" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
