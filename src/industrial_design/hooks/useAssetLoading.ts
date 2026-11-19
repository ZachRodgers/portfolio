import { useState, useEffect } from "react";

interface AssetLoadingState {
  portfolioImages: boolean;
  resumeData: boolean;
  brandingData: boolean;
  heroAssets: boolean;
}

const useAssetLoading = () => {
  const [loadingState, setLoadingState] = useState<AssetLoadingState>({
    portfolioImages: false,
    resumeData: false,
    brandingData: false,
    heroAssets: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      const promises = [];

      // Load portfolio images data
      promises.push(
        fetch("/assets/portfolio/projects.json")
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(() => {
            setLoadingState((prev) => ({ ...prev, portfolioImages: true }));
          })
          .catch((error) => {
            console.error("Error loading portfolio images:", error);
            setLoadingState((prev) => ({ ...prev, portfolioImages: true }));
          })
      );

      // Load resume data
      promises.push(
        fetch("/assets/resume/resume.json")
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(() => {
            setLoadingState((prev) => ({ ...prev, resumeData: true }));
          })
          .catch((error) => {
            console.error("Error loading resume data:", error);
            setLoadingState((prev) => ({ ...prev, resumeData: true }));
          })
      );

      // Load branding data
      promises.push(
        fetch("/assets/branding/branding.json")
          .then((response) => {
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(() => {
            setLoadingState((prev) => ({ ...prev, brandingData: true }));
          })
          .catch((error) => {
            console.error("Error loading branding data:", error);
            setLoadingState((prev) => ({ ...prev, brandingData: true }));
          })
      );

      // Hero assets (currently just a placeholder, but ready for future implementation)
      promises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            setLoadingState((prev) => ({ ...prev, heroAssets: true }));
            resolve(true);
          }, 300);
        })
      );

      await Promise.all(promises);
    };

    loadAssets();
  }, []);

  useEffect(() => {
    const allLoaded = Object.values(loadingState).every((loaded) => loaded);
    if (allLoaded) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [loadingState]);

  return { isLoading, loadingState };
};

export default useAssetLoading;
