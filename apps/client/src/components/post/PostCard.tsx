import type {Post} from "../../modules/types/post.type.ts"
import {Clock, User} from "lucide-react";

interface Props {
    post: Post;
}

export const PostCard = ({post}: Props) => {
    const ellipsedBody = post.body.length > 150 ? post.body.slice(0, 150) + '...' : post.body;

    return (
        <div className="card p-2 w-full bg-base-100 shadow-md shadow-base-300 cursor-pointer hover:scale-101 duration-200 transition-transform ease-in-out active:scale-99">
            <div className="card-body">
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="card-title truncate block">
                            {post.title}
                        </div>
                        <div className="">
                            {ellipsedBody}
                        </div>
                    </div>
                    <div className="flex flex-col justify-between shrink-0">
                        <div className="flex whitespace-nowrap items-center gap-2">
                            <User size={16} /> {post.author} wadwawdwa
                        </div>
                        <div className="flex whitespace-nowrap items-center gap-2">
                            <Clock size={16} /> {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}