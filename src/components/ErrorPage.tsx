import { useEffect } from 'react';

export function ErrorPage({
  error,
  resetError,
}: {
  error: Error & { digest?: string }
  resetError?: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>An unhandled error occurred!</h2>
      <blockquote>
        <code>
          {error.message}
        </code>
      </blockquote>
      {resetError && <button onClick={() => resetError()}>Try again</button>}
    </div>
  );
}
