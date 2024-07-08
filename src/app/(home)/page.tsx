import { CategoryList } from '@/components/category'
import { RoomList } from '@/components/room'
import { Category, ListResponse, ResponsePaginate,Response, Room } from '@/models';
import { Box } from '@mui/material'
import { cookies } from 'next/headers'
import createFetch from '@vercel/fetch';
const fetch = createFetch();
import Agent from 'agentkeepalive';

// Create a keep-alive HTTP agent
const keepaliveAgent = new Agent.HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const getRoomList = async (searchParams: string): Promise<Response<ResponsePaginate<Room>>> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms?limit=12${searchParams && '&' +searchParams}`, {
    method: 'GET',
    agent: keepaliveAgent, // Pass the keep-alive agent to the fetch request
    headers: {
      'Authorization': `Bearer ${cookies().get('accessToken')?.value}`,
    },
  })
  return res.json() as Promise<Response<ResponsePaginate<Room>>>
}

const getCategoryList = async (): Promise<ListResponse<Category>> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`,{
    agent: keepaliveAgent,
  })
  return res.json() as Promise<ListResponse<Category>>;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[][] | Record<string, string> | URLSearchParams | undefined };
}) {
  const search = new URLSearchParams(searchParams as URLSearchParams | undefined).toString();
  const rooms = await getRoomList(search)
  const categories = await getCategoryList()
  
  return (
    <Box component={'section'} maxWidth={'1360px'} width={'100%'} margin={'auto'}>
      <Box sx={{ padding: '20px 0' }}>
        <CategoryList categories={categories.data}></CategoryList>
      </Box>
      <Box padding={'12px'}>
        <RoomList rooms={rooms.data}></RoomList>
      </Box>
    </Box>
  )
}
