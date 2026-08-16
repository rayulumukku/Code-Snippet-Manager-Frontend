const StructuredData = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://rayulumukku.com/project/code-snippet-manager/#application",
        "name": "Code Snippet Manager",
        "url": "https://rayulumukku.com/project/code-snippet-manager/",
        "description": "A web-based code snippet manager for storing, organizing, searching, editing, and managing reusable code snippets.",
        "applicationCategory": "DeveloperApplication",
        "applicationSubCategory": "Code Snippet Manager",
        "operatingSystem": "Any",
        "browserRequirements": "Requires a modern web browser",
        "isAccessibleForFree": true,
        "featureList": [
          "Create and edit code snippets",
          "Syntax highlighting",
          "Search snippets",
          "Organize code snippets",
          "Snippet collections",
          "Code snippet sharing"
        ],
        "provider": {
          "@type": "Person",
          "name": "Rayulu Mukku",
          "url": "https://rayulumukku.com/"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://rayulumukku.com/#website",
        "url": "https://rayulumukku.com/",
        "name": "Rayulu Mukku",
        "publisher": {
          "@type": "Person",
          "name": "Rayulu Mukku"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://rayulumukku.com/project/code-snippet-manager/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://rayulumukku.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Projects",
            "item": "https://rayulumukku.com/projects"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Code Snippet Manager",
            "item": "https://rayulumukku.com/project/code-snippet-manager/"
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
};

export default StructuredData;
