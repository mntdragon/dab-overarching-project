import { authClient } from "../utils/auth.js";

class UserState {
  user = $state(null);
  session = $state(null);
  isLoaded = $state(false); 
  constructor() {
    this.fetchUser();
  }

  async fetchUser() {
    try {
      const { data } = await authClient.getSession();
      if (data) {
        this.user = data.user;
        this.session = data.session;
      } else {
        this.user = null;
        this.session = null;
      }
    } catch (e) {
      this.user = null;
    } finally {
      this.isLoaded = true;
    }
  }

  async logout() {
    await authClient.signOut();
    this.user = null;
    this.session = null;
    window.location.href = "/";
  }
}

export const userState = new UserState();