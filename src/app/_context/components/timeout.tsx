import { useEffect, useState } from "react";

export function Card({children}: {children: React.ReactNode}) {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setShown(true);
  
        }, 10)
    }, []); 
    return (
        shown ? children : <>Loading...</>
    );
}