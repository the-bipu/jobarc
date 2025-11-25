import { UserContext } from '@/context/userContext'
import React, { useContext } from 'react'

const dashboard = () => {
    const { userData, authenticated } = useContext(UserContext);

    return (
        <React.Fragment>
            {authenticated ? (
                <>
                    {userData?.type === 'admin' ? (
                        <div>
                            here admin
                        </div>
                    ) : (
                        <div>
                            here user
                        </div>
                    )}
                </>
            ) : (
                <div>
                    not authenticated, please login first!
                </div>
            )}
        </React.Fragment>
    )
}

export default dashboard