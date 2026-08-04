import { GlobePreview } from "./components/GlobePreview";
import { FloatingHeader } from "./components/FloatingHeader";
import { HomepageDock } from "./components/HomepageDock";
import { ProfileIntro } from "./components/ProfileIntro";
import { ProjectsPreview } from "./components/ProjectsPreview";
import { RepositoriesPreview } from "./components/RepositoriesPreview";

export function App() {
  return (
    <>
      <FloatingHeader />
      <main id="home">
        <ProfileIntro />
        <ProjectsPreview />
        <RepositoriesPreview />
        <GlobePreview />
      </main>
      <HomepageDock />
    </>
  );
}
