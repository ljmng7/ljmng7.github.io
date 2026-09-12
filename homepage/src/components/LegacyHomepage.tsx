import { GlobePreview } from "./GlobePreview";
import { FloatingHeader } from "./FloatingHeader";
import { HomepageDock } from "./HomepageDock";
import { ProfileIntro } from "./ProfileIntro";
import { ProjectsPreview } from "./ProjectsPreview";
import { RepositoriesPreview } from "./RepositoriesPreview";

export function LegacyHomepage() {
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
