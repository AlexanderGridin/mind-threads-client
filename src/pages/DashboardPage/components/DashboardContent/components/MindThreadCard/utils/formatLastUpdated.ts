export const formatLastUpdated = (lastUpdatedDate: string): string => {
  const nowTime = new Date().getTime();
  const updatedTime = new Date(lastUpdatedDate).getTime();

  const diffInMs = nowTime - updatedTime;

  if (diffInMs < 0) return "";

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "just now";
  }

  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  if (diffInDays === 1) {
    return "yesterday";
  }

  return `${diffInDays} days ago`;
};
