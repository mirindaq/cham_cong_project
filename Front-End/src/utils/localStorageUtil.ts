import type { User } from "@/types/user.type";

export const localStorageUtil = {
  setUserToLocalStorage: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  },
  getUserFromLocalStorage: () => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  },
  removeUserFromLocalStorage: () => {
    localStorage.removeItem("user");
  },
};
