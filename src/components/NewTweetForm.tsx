import { useSession } from "next-auth/react"
import { Button } from "./Button"
import { ProfileImage } from "./ProfileImage"
import { FormEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { api } from "~/utils/api";
import { Tweet } from "@prisma/client";

function updateTextAreaSize(textArea:HTMLTextAreaElement|undefined){
    if(textArea==null)return ;
    textArea.style.height = "0"
    textArea.style.height = `${textArea.scrollHeight}px`

}




export function NewTweetForm(){
    const session = useSession()
    if(session.status !== "authenticated") return null;
    return <Form/>
   
}


function Form(){
    const session = useSession()
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>()
    const inputRef = useCallback((textArea:HTMLTextAreaElement)=>{
        updateTextAreaSize(textArea)
        textAreaRef.current = textArea
    },[])
    const trpcUtils = api.useContext()

    useLayoutEffect(()=>{
        return updateTextAreaSize(textAreaRef.current);
    },[inputValue])

   const createTweet = api.tweet.create.useMutation({onSuccess:(newTweet) =>{
    
    setInputValue("")
    if(session.status !== "authenticated")return 
    trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (old) => {
        if(old == null || old?.pages[0] == null) return 

        const newCacheTweet = {
            ...newTweet,
            likeCount:0,
            likedByMe:false,
            user:{
                id:session.data.user.id,
                name:session.data.user.name || null,
                image:session.data.user.image || null
            }
        }

        return {
            ...old,
            pages:[
                {
                    ...old.pages[0],
                    tweets:[newCacheTweet, ...old.pages[0].tweets]
                },
                ...old.pages.slice(1)
            ]
        }
    })
    
   }})

   function handleSubmit(e:FormEvent){
    e.preventDefault();
    createTweet.mutate({content:inputValue})
   }

    return <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4">
            <ProfileImage src={session.data?.user?.image}/>

            <textarea style={{height:0}}
            ref={inputRef}
            value={inputValue}
            onChange={(e)=>setInputValue(e.target.value)}
            
            
            className="flex flex-grow resize-none overflow-hidden p-4 text-lg outline-none" placeholder="What's happening?"></textarea>
        </div>

        <Button className="self-end">Tweet</Button>

    </form>

}
