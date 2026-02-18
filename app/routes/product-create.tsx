import React from 'react'
import { authenticate } from '~/qumra.server'


export async function action({request}:{request:Request}) {
    const {} = await authenticate.admin(request)
    const data = await request.json()
    console.log("🚀 ~ action ~ data:", data)
    return Response.json({data})
}

// function ProductCreate() {
//   return (
//     <div>ProductCreate</div>
//   )
// }

// export default ProductCreate