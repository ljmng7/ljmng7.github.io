import { profile } from "../data/profile";
import { ContributionGrid } from "./ContributionGrid";
import { GitHubButton } from "./GitHubButton";
import { useLanguage } from "./LanguageProvider";
import { SpinningText } from "./SpinningText";
import { Text3DFlip } from "./Text3DFlip";

export function ProfileIntro() {
  const { messages } = useLanguage();

  return (
    <section className="profile-intro">
      <div className="container profile-intro-layout">
        <div className="profile-intro-copy">
          <div className="profile-avatar-orbit">
            <SpinningText
              aria-label={messages.profile.orbitLabel}
              className="profile-avatar-spinning-text"
              duration={20}
              radius="var(--profile-spinning-text-radius)"
            >
              {messages.profile.orbitText}
            </SpinningText>
            <img
              className="profile-intro-avatar"
              data-floating-header-source="avatar"
              src={profile.avatarUrl}
              alt={messages.profile.avatarAlt}
            />
          </div>
          <div className="profile-intro-text">
            <div className="profile-intro-name-slot">
              <h1 className="profile-intro-name" data-floating-header-source="name">
                <Text3DFlip
                  flipTextClassName="profile-intro-name-face"
                  rotateDirection="top"
                  staggerDuration={0.03}
                  staggerFrom="first"
                  textClassName="profile-intro-name-face"
                  transition={{ type: "spring", damping: 25, stiffness: 160 }}
                >
                  {profile.name}
                </Text3DFlip>
              </h1>
            </div>
            <p className="profile-intro-bio">{messages.profile.bio}</p>
            <GitHubButton
              ariaLabel={messages.profile.githubAriaLabel}
              href={profile.githubUrl}
              iconUrl={profile.githubIconUrl}
              label={messages.profile.githubLabel}
            />
          </div>
        </div>

        <ContributionGrid />
      </div>
    </section>
  );
}
