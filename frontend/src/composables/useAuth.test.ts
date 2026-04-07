import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAuthUser = {
  id: number;
  username: string;
};

class MockApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const setupAuthModule = async () => {
  const loginMock = vi.fn();
  const meMock = vi.fn();
  const logoutMock = vi.fn();

  vi.doMock("../lib/api", () => ({
    ApiError: MockApiError,
    authApi: {
      login: loginMock,
      me: meMock,
      logout: logoutMock,
    },
  }));

  const authModule = await import("./useAuth");

  return {
    ...authModule,
    loginMock,
    meMock,
    logoutMock,
  };
};

const alice: MockAuthUser = {
  id: 1,
  username: "alice",
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("useAuth composable", () => {
  it("bootstraps an existing authenticated session", async () => {
    const { useAuth, ensureAuthBootstrapped, meMock } = await setupAuthModule();
    meMock.mockResolvedValue({ user: alice });

    const auth = useAuth();
    const user = await ensureAuthBootstrapped();

    expect(user).toEqual(alice);
    expect(auth.user.value).toEqual(alice);
    expect(auth.hasBootstrapped.value).toBe(true);
    expect(auth.bootstrapError.value).toBeNull();
  });

  it("treats a 401 bootstrap response as logged out without surfacing an error", async () => {
    const { useAuth, ensureAuthBootstrapped, meMock } = await setupAuthModule();
    meMock.mockRejectedValue(
      new MockApiError("Authentication required", 401, {
        message: "Authentication required",
      }),
    );

    const auth = useAuth();
    const user = await ensureAuthBootstrapped();

    expect(user).toBeNull();
    expect(auth.user.value).toBeNull();
    expect(auth.hasBootstrapped.value).toBe(true);
    expect(auth.bootstrapError.value).toBeNull();
  });

  it("updates auth state on successful login", async () => {
    const { useAuth, loginMock } = await setupAuthModule();
    loginMock.mockResolvedValue({ user: alice });

    const auth = useAuth();
    const user = await auth.login("alice", "password123");

    expect(user).toEqual(alice);
    expect(auth.user.value).toEqual(alice);
    expect(auth.isAuthenticated.value).toBe(true);
    expect(auth.authError.value).toBeNull();
    expect(auth.hasBootstrapped.value).toBe(true);
  });

  it("surfaces login errors and keeps the user logged out", async () => {
    const { useAuth, loginMock } = await setupAuthModule();
    loginMock.mockRejectedValue(new Error("Invalid username or password"));

    const auth = useAuth();

    await expect(auth.login("alice", "wrong-password")).rejects.toThrow(
      "Invalid username or password",
    );
    expect(auth.user.value).toBeNull();
    expect(auth.authError.value).toBe("Invalid username or password");
    expect(auth.isAuthenticated.value).toBe(false);
  });

  it("clears local auth state on logout even when the API request fails", async () => {
    const { useAuth, loginMock, logoutMock } = await setupAuthModule();
    loginMock.mockResolvedValue({ user: alice });
    logoutMock.mockRejectedValue(new Error("Logout failed"));

    const auth = useAuth();
    await auth.login("alice", "password123");

    await expect(auth.logout()).rejects.toThrow("Logout failed");
    expect(auth.user.value).toBeNull();
    expect(auth.isAuthenticated.value).toBe(false);
    expect(auth.hasBootstrapped.value).toBe(true);
    expect(auth.isLoading.value).toBe(false);
  });
});
