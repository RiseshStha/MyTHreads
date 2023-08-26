import ProfileHeader from '@/components/shared/ProfileHeader';
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions';
import {currentUser} from '@clerk/nextjs';
import {redirect} from 'next/navigation';
import Image from "next/image";
import ThreadTab from '@/components/shared/ThreadTab';
import UserCard from '@/components/cards/UserCard';

const Page = async () => {
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);// to see selected user profile not only currently login user

    if(!userInfo?.onboarded) redirect('/onboarding');

    //Fetch users
    const result = await fetchUsers({
        userId: user.id,
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })

    return(
        <section>
            <h1 className="head-text mb-10">Search</h1>
            {/* SearchBar */}

            <div className='mt-14 flex flex-col gap-9'>
                {result.users.length === 0 ? (
                    <p className='np-result'>No Users</p>
                ): (
                    <>
                    {result.users.map((person) => (
                        <UserCard 
                            key={person.id}
                            id={person.id}
                            name={person.name}
                            username={person.username}
                            imgUrl={person.image}
                            personType='User'
                        />
                    ))}
                    </>
                )}

            </div>
        </section>
    )
}

export default Page;