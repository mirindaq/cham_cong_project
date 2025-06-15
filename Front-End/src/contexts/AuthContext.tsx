import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { localStorageUtil } from "@/utils/localStorageUtil";
import { authApi } from "@/services/authe.service";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { UserResponse } from "@/types/user.type";
import { userApi } from "@/services/user.service";
interface AuthContextInterface {
  accessToken: string | null;
  role: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  showChangePasswordModal: boolean;
  setShowChangePasswordModal: (show: boolean) => void;
  pendingUsername: string | null;
  setPendingUsername: (username: string | null) => void;
  user: UserResponse | null;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>( null  );
  const [refreshToken, setRefreshToken] = useState<string | null>( null );
  const [role, setRole] = useState<string | null>( null );
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const navigate = useNavigate();

  const saveAuthToLocalStorage = (token: string, role: string) => {
    localStorageUtil.setAuthToLocalStorage(token, role);
  };

  useEffect(() => {
    const storedAccessToken = localStorageUtil.getAccessTokenFromLocalStorage();
    const storedRefreshToken = localStorageUtil.getRefreshTokenFromLocalStorage();
    const storedRole = localStorageUtil.getRoleFromLocalStorage();
    
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken); 
    setRole(storedRole);
    if (storedAccessToken) {
      userApi.getProfile().then((response) => {
        const profile = response.data;
        setUser(profile);
      }).catch(() => {
        logout();
      });
    }
  }, [accessToken]);



  const clearAuth = () => {
    localStorageUtil.removeAuthFromLocalStorage();
    setAccessToken(null);
    setRole(null);
    setRefreshToken(null);
    setUser(null);
  };


  const login = async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      const { accessToken, role, refreshToken } = res.data;

      setAccessToken(accessToken);
      setRole(role);
      setRefreshToken(refreshToken);
      localStorageUtil.setRefreshTokenToLocalStorage(refreshToken);
      saveAuthToLocalStorage(accessToken, role);
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "EMPLOYEE") {
        navigate("/employee/dashboard");
      }
    } catch (error: any) {
      if (error.message.includes("change your password")) {
        sessionStorage.setItem("pendingUsername", username);
        setPendingUsername(username);
        setShowChangePasswordModal(true);
        toast.success(
          "Đăng nhập lần đầu, vui lòng thiết lập mật khẩu để tiếp tục."
        );
      } else {
        toast.error("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    }
  };


  const logout = async () => {
    try {
      const response = await authApi.logout(accessToken!);
      if (response.status === 200) {
        clearAuth();
        navigate("/login");
      }
    } catch (error) {
      clearAuth();
      navigate("/login");
    }

  };

  return (
    <AuthContext.Provider
      value={{
        showChangePasswordModal,
        setShowChangePasswordModal,
        pendingUsername,
        setPendingUsername,
        accessToken,
        role,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

