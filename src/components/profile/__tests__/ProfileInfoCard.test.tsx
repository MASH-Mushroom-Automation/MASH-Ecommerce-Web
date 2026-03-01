/**
 * Tests for ProfileInfoCard component
 * Covers: auth providers, loading states, backend profile data, name/email display, slots
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...p }: any) => <span {...p}>{children}</span>,
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...p }: any) => <label {...p}>{children}</label>,
}));
jest.mock("@/components/profile/ProfilePictureUpload", () => ({
  ProfilePictureUpload: ({ user }: any) => <div data-testid="avatar">{user?.displayName}</div>,
}));

import { ProfileInfoCard } from "../ProfileInfoCard";

const baseUser = {
  id: "u1",
  email: "test@test.com",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  provider: "email" as const,
  emailVerified: true,
  twoFactorEnabled: false,
};

describe("ProfileInfoCard", () => {
  const phoneSlot = <div data-testid="phone-slot">Phone</div>;
  const passSlot = <div data-testid="pass-slot">Password</div>;

  it("renders account information heading", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText("Account Information")).toBeInTheDocument();
  });

  it("renders email auth badge", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText("Email/Password")).toBeInTheDocument();
  });

  it("renders google auth badge", () => {
    render(
      <ProfileInfoCard user={{ ...baseUser, provider: "google" }} authProvider="google" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText("Google Account")).toBeInTheDocument();
  });

  it("renders password linked badge for google with password", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="google" hasPassword={true} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText("Password Linked")).toBeInTheDocument();
  });

  it("does not render password linked for google without password", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="google" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.queryByText("Password Linked")).not.toBeInTheDocument();
  });

  it("shows name from user when no backend profile", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    const matches = screen.getAllByText(/John/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows name from backend profile when available", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={{ firstName: "Jane", lastName: "Smith", email: "jane@test.com" }} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText(/Jane/)).toBeInTheDocument();
  });

  it("shows loading spinner when profileLoading", () => {
    const { container } = render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={true} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(container.querySelectorAll(".animate-spin").length).toBeGreaterThan(0);
  });

  it("shows N/A when no name available", () => {
    render(
      <ProfileInfoCard user={{ ...baseUser, firstName: undefined, lastName: undefined }} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getAllByText(/N\/A/).length).toBeGreaterThan(0);
  });

  it("renders phone and password slots", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByTestId("phone-slot")).toBeInTheDocument();
    expect(screen.getByTestId("pass-slot")).toBeInTheDocument();
  });

  it("shows email from backend profile", () => {
    render(
      <ProfileInfoCard user={baseUser} authProvider="email" hasPassword={false} profileLoading={false} backendProfile={{ email: "backend@test.com" }} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(screen.getByText("backend@test.com")).toBeInTheDocument();
  });

  it("handles null user gracefully", () => {
    const { container } = render(
      <ProfileInfoCard user={null} authProvider="unknown" hasPassword={false} profileLoading={false} backendProfile={null} phoneSection={phoneSlot} passwordSection={passSlot} />
    );
    expect(container).toBeDefined();
  });
});
