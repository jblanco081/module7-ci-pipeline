export function CategoryIcon({ category }: { category: string }) {
  const cls = "w-6 h-6 text-emerald-600 inline-block";

  switch (category) {
    case "vegetable":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2c-3 0-6 3-6 8s3 12 6 12 6-7 6-12-3-8-6-8z" />
          <path d="M12 2v6" />
        </svg>
      );
    case "herb":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 20c0-4 2-8 6-10" />
          <path d="M12 10c4-2 8 0 8 4s-4 6-8 6" />
          <path d="M12 10c-4-2-8 0-8 4s4 6 8 6" />
        </svg>
      );
    case "flower":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 7c0-3 2-5 4-5s2 3 0 5" />
          <path d="M12 7c0-3-2-5-4-5s-2 3 0 5" />
          <path d="M15 10c3 0 5 2 5 4s-3 2-5 0" />
          <path d="M9 10c-3 0-5 2-5 4s3 2 5 0" />
          <path d="M12 13v8" />
        </svg>
      );
    case "fruit":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4c-4 0-7 4-7 8s3 8 7 8 7-4 7-8-3-8-7-8z" />
          <path d="M10 2c1 1 2 2 2 4" />
          <path d="M14 2c-1 1-2 2-2 4" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
