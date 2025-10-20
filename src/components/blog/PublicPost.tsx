'use client';

import { useTranslation } from 'react-i18next';
import type { IBlogPost } from '@/entities/BlogPost';
import styles from './PublicPost.module.css';

interface Props {
  post: IBlogPost;
}

export default function PublicPost({ post }: Props) {
  const { t } = useTranslation();

  return (
    <article className={`prose max-w-none mx-auto py-8 ${styles.article}`}>
      <h1 className="mb-4">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p className="mt-6 text-sm text-gray-500">
        {t('sharePrompt', { defaultValue: 'Enjoyed this story? Share the link with a friend.' })}
      </p>
    </article>
  );
}
