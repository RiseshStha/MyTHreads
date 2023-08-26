 // to rendered it in the client side but default it is rendered in server side
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.action";
import {currentUser} from "@clerk/nextjs"

export default async function Home() {
  //now start with fetching the post
  const result = await fetchPosts(1, 30);// now we  are passing hardcore argument , later on we pass it dynamically
  const user = await currentUser();

  // console.log(result);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0? (
          <p className="no-result" >No threads found </p>
        ): (
          <>
          {result.posts.map((post) => (
            <ThreadCard  // create ThreadCard in components/card
            key={post._id}
            id={post._id}
            currentUserId={user?.id || ""}
            parentId={post.parentId}
            content={post.text}
            author={post.author}
            community={post.community}
            createdAt={post.createdAt}
            comments={post.children}
            />
          ))}
          </>
        )}
      </section>
    </>
  )
}
