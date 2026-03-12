// components/content/ContentContainer.jsx
import React from "react";
import UserContentContainer from "./UserContentContainer";

// Render-only container: show the same content UI for all roles.
export default function ContentContainer({ categoryId, moduleId, titleCategory, userRole, scrollToContentId, onScrolledToContent }) {
  return (
    <UserContentContainer
      categoryId={categoryId}
      moduleId={moduleId}
      titleCategory={titleCategory}
      scrollToContentId={scrollToContentId}
      onScrolledToContent={onScrolledToContent}
    />
  );
}
