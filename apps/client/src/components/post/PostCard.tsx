import type { Post } from '../../modules/types/post.type.ts';
import { Clock, User } from 'lucide-react';
import { stripMarkdown } from '../../utils/markdown.ts';

interface Props {
    post: Post;
}

export const PostCard = ({ post }: Props) => {
    const ellipsedBody =
        post.body.length > 150 ? post.body.slice(0, 150) + '...' : post.body;

    return (
        <div
            className="card p-2 w-full bg-base-100 shadow-md shadow-base-300 cursor-pointer hover:scale-101
        duration-200 transition-transform ease-in-out active:scale-99 border border-base-300"
        >
            <a href={`/post/${post.id}`}>
                <div className="card-body">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <div className="card-title truncate block">
                                {post.title}
                            </div>
                            <div className="">
                                {stripMarkdown(ellipsedBody)}
                            </div>
                        </div>
                        <div className="flex lg:flex-col justify-between shrink-0 w-full lg:w-auto gap-2 lg:items-end lg:mt-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <User size={16} className="shrink-0" />
                                <div className="truncate text-sm lg:max-w-50">
                                    {post.author.email}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-sm whitespace-nowrap">
                                <Clock size={16} />{' '}
                                {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};
