export default backend => {
  return {
    getInterfaces: async ({ setState, state }) => {
      if (state.loadingInterfaces) return;
      setState({ initializing: false, loadingInterfaces: true });

      let res = await backend.getInterfaces();
      if (res instanceof Error) {
        return setState({
          error: state.t("interfacesError"),
          initializing: false,
          interfaces: null,
          loadingInterfaces: false
        });
      }

      /*eslint no-sequences: 0*/
      let interfaces = Object.keys(res)
        .filter(i => !i.startsWith("wlan"))
        .reduce((a, b) => ((a[b] = res[b]), a), {});

      let port = state.port;
      if (!port && interfaces.length > 0) {
        port = interfaces.sort()[0];
        setState({ port });
      }

      return {
        error: null,
        initializing: false,
        interfaces,
        loadingInterfaces: false
      };
    },

    setInterface: async ({ state, setState }, mode) => {
      let interfaces = state.interfaces;
      interfaces[state.port] = mode;
      setState({ interfaces });
      await backend.setInterface(state.port, mode);
    },

    setPort: async ({ state, setState }, port) => {
      return { port };
    },

    getWifiSettings: async ({ setState, state }) => {
      if (state.loading) return;

      setState({ initializing: false, loading: true });

      let res = await backend.getWifiSettings();
      if (res instanceof Error) {
        let wifiError, loading;
        if (res.message === "502") {
          wifiError = state.t("serverwifiError");
          loading = null;
        } else {
          wifiError = state.t("wifiwifiError");
          loading = false;
        }
        return setState({
          initializing: false,
          wifiError,
          wifiSettings: null,
          loading
        });
      }

      return {
        initializing: false,
        wifiError: null,
        wifiSettings: res,
        loading: false
      };
    },

    saveWifiSetting: async ({ state, setState }, setting, radio) => {
      setState({
        loading: radio
      });

      await backend.setWifiSettings(setting);
      return { loading: false, success: radio };
    }
  };
};
