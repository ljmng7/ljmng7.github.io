interface GitHubButtonProps {
  ariaLabel: string;
  href: string;
  iconUrl: string;
  label: string;
}

export function GitHubButton({ ariaLabel, href, iconUrl, label }: GitHubButtonProps) {
  return (
    <a
      className="profile-github-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
    >
      <span className="profile-github-content">
        <span className="profile-github-icon-slot" aria-hidden="true">
          <img
            className="profile-github-image"
            data-floating-header-source="github"
            src={iconUrl}
            alt=""
          />
        </span>
        <span className="profile-github-label">{label}</span>
      </span>
      <span className="profile-github-hover-content" aria-hidden="true">
        <img
          className="profile-github-image profile-github-image--hover"
          src={iconUrl}
          alt=""
        />
        <span className="profile-github-action">
          <span>GitHub</span>
          <svg className="profile-github-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-7-7 7 7-7 7"
            />
          </svg>
        </span>
      </span>
    </a>
  );
}
