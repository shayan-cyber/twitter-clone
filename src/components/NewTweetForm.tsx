import { useSession } from "next-auth/react"
import { Button } from "./Button"
import { ProfileImage } from "./ProfileImage"
import { FormEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { api } from "~/utils/api";

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
    useLayoutEffect(()=>{
        return updateTextAreaSize(textAreaRef.current);
    },[inputValue])

   const cerateTweet = api.tweet.create.useMutation({onSuccess:(newTweet) =>{
   
    setInputValue("")
    
   }})

   function handleSubmit(e:FormEvent){
    e.preventDefault();
    cerateTweet.mutate({content:inputValue})
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
