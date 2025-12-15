import { BookDemoSidebar } from 'components/BookDemoSidebar'
import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import MoreStories from 'components/MoreStories'
import PostBody from 'components/PostBody'
import PostHeader from 'components/PostHeader'
import PostPageHead from 'components/PostPageHead'
import PostTitle from 'components/PostTitle'
import SectionSeparator from 'components/SectionSeparator'
import { TableOfContents } from 'components/TableOfContents'
import * as demo from 'lib/demo.data'
import type { Post, Settings } from 'lib/sanity.queries'
import Error from 'next/error'

export interface PostPageProps {
  preview?: boolean
  loading?: boolean
  post: Post
  morePosts: Post[]
  settings: Settings
}

const NO_POSTS: Post[] = []

export default function PostPage(props: PostPageProps) {
  const { preview, loading, morePosts = NO_POSTS, post, settings } = props
  const { title = demo.title } = settings || {}

  const slug = post?.slug

  if (!slug && !preview) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <PostPageHead settings={settings} post={post} />

      <Layout preview={preview} loading={loading}>
        <Container>
          <BlogHeader title={title} level={2} />
          {preview && !post ? (
            <PostTitle>Loading…</PostTitle>
          ) : post ? (
            <>
              <article>
                <PostHeader
                  title={post.title}
                  coverImage={post.coverImage}
                  date={post.date}
                  author={post.author}
                />
                <div className="lg:grid lg:grid-cols-[200px_1fr_200px] lg:gap-8 xl:gap-12">
                  <aside className="hidden lg:block">
                    <TableOfContents content={post.content} />
                  </aside>
                  <div>
                    <PostBody content={post.content} />
                  </div>
                  <aside className="hidden lg:block">
                    <BookDemoSidebar calendlyUrl="https://calendly.com/viresh-managooli-folksoft/folksoft-discovery-call" />
                  </aside>
                </div>
              </article>
              <SectionSeparator />
              {morePosts?.length > 0 && <MoreStories posts={morePosts} />}
            </>
          ) : null}
        </Container>
      </Layout>
    </>
  )
}
