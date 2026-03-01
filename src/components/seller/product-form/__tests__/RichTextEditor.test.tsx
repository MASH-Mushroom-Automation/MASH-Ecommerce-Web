import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock tiptap editor
const mockChain = {
  focus: jest.fn().mockReturnThis(),
  toggleBold: jest.fn().mockReturnThis(),
  toggleItalic: jest.fn().mockReturnThis(),
  toggleStrike: jest.fn().mockReturnThis(),
  toggleHeading: jest.fn().mockReturnThis(),
  toggleBulletList: jest.fn().mockReturnThis(),
  toggleOrderedList: jest.fn().mockReturnThis(),
  setTextAlign: jest.fn().mockReturnThis(),
  undo: jest.fn().mockReturnThis(),
  redo: jest.fn().mockReturnThis(),
  extendMarkRange: jest.fn().mockReturnThis(),
  setLink: jest.fn().mockReturnThis(),
  unsetLink: jest.fn().mockReturnThis(),
  run: jest.fn(),
};

const mockEditor = {
  chain: jest.fn(() => mockChain),
  isActive: jest.fn(() => false),
  can: jest.fn(() => ({ undo: () => true, redo: () => true })),
  getAttributes: jest.fn(() => ({ href: "" })),
  getText: jest.fn(() => "Test content"),
  getHTML: jest.fn(() => "<p>Test content</p>"),
};

jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">{editor ? "Editor loaded" : "No editor"}</div>
  ),
}));

jest.mock("@tiptap/starter-kit", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock("@tiptap/extension-link", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock("@tiptap/extension-placeholder", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock("@tiptap/extension-text-align", () => ({
  __esModule: true,
  default: { configure: jest.fn(() => ({})) },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, title, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="link-dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

import { RichTextEditor } from "../RichTextEditor";

describe("RichTextEditor", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render editor content area", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.getByText("Editor loaded")).toBeInTheDocument();
  });

  it("should render formatting toolbar buttons", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTitle("Bold")).toBeInTheDocument();
    expect(screen.getByTitle("Italic")).toBeInTheDocument();
    expect(screen.getByTitle("Strikethrough")).toBeInTheDocument();
    expect(screen.getByTitle("Heading 2")).toBeInTheDocument();
    expect(screen.getByTitle("Bullet List")).toBeInTheDocument();
    expect(screen.getByTitle("Numbered List")).toBeInTheDocument();
  });

  it("should render alignment buttons", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTitle("Align Left")).toBeInTheDocument();
    expect(screen.getByTitle("Align Center")).toBeInTheDocument();
    expect(screen.getByTitle("Align Right")).toBeInTheDocument();
  });

  it("should render undo/redo buttons", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTitle("Undo")).toBeInTheDocument();
    expect(screen.getByTitle("Redo")).toBeInTheDocument();
  });

  it("should render Insert Link button", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTitle("Insert Link")).toBeInTheDocument();
  });

  it("should call bold toggle on clicking Bold", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByTitle("Bold"));
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockChain.toggleBold).toHaveBeenCalled();
  });

  it("should call italic toggle on clicking Italic", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByTitle("Italic"));
    expect(mockChain.toggleItalic).toHaveBeenCalled();
  });

  it("should show character count", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} maxLength={5000} />);
    // getText() returns "Test content" = 12 chars
    expect(screen.getByText("12 / 5000")).toBeInTheDocument();
  });

  it("should display error message", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} error="Description is required" />);
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("should open link dialog when Insert Link is clicked", () => {
    render(<RichTextEditor value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByTitle("Insert Link"));
    expect(screen.getByTestId("link-dialog")).toBeInTheDocument();
    expect(screen.getByText("Insert Link", { selector: "h2" })).toBeInTheDocument();
  });

  it("should return null when editor is null", () => {
    const { useEditor } = require("@tiptap/react");
    (useEditor as jest.Mock).mockReturnValueOnce(null);
    const { container } = render(<RichTextEditor value="" onChange={mockOnChange} />);
    expect(container.firstChild).toBeNull();
  });
});
