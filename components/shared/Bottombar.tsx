"use client" // to tell it is client side rendering
import {sidebarLinks} from "@/constants";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

//bottombar is for mobile devices display
function Bottombar(){
    const pathname = usePathname();
    return (
        <section className="bottombar">
            <div className="bottombar_container">
            {sidebarLinks.map((link) => {
                    const isActive = (pathname.includes
                        (link.route) && link.route.length > 1) || pathname === link.route;
                return (
                    <Link href={link.route}
                    key={link.label} //because we are mappong over the elements
                    className={`bottombar_link 
                     ${isActive && 'bg-primary-500'}`} // check which class is active and change it's color to bg-primary-500
                    >
                        <Image
                            src={link.imgURL}
                            alt={link.label}
                            width={24}
                            height={24}
                        />

                        <p className="text-subtle-medium 
                        text-light-1
                         max-sm:hidden"> 
                            {link.label.split(/\s+/)[0]}
                        </p> 
                    </Link> // in paragraph we display title of icon in tablet and desktop mode only
                            //but only first name of title ex: title is Risesh Sama Shrestha and we only display Risesh
            )}              //using ternary operator (/\s+/)[0]
            )}
            </div>
        </section>
    )
}
export default Bottombar;