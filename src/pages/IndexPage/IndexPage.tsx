import './IndexPage.css';
import axios from "axios";
import { useMemo, type FC, useEffect, useState } from 'react';
import { Page } from "../../components/Page";
import { ActionsGrid } from '../../components/Cards/ActionsGrid.tsx';
import { User, QRScanner, postEvent } from '@tma.js/sdk';
import { useInitData, useMiniApp, useMainButton } from '@tma.js/sdk-react';
import { SetupTeam } from '../../components/Cards/SetupTeam.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerInformationCard } from '../../components/Cards/BannerInformationCard.tsx';
import { apiRoutes } from '../../api/apiRoutes.tsx';
import { BASE_URL } from '../../constants/constant.tsx';
import { PosPage } from '../../components/Pos/PosPage.tsx';
import { useProductQuery } from '../../api/hooks/useProductQuery.tsx';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Spinner } from '@xelene/tgui';
import { Center, Group, ScrollArea, rem } from '@mantine/core';
import { IconScan, IconSettings } from '@tabler/icons-react';
const scanner = new QRScanner('6.3', postEvent);

async function connectAPI(params: any) {
  const connect = await axios.post(
      `${BASE_URL}${apiRoutes.useTelegramIDConnect}`,
      params,
      {
        headers: {
            'Content-Type': 'application/json',
        },
      }
  )
  .then(async (res) => {
    await AsyncStorage.setItem("UserLogin", JSON.stringify(res.data));
  });

  return await connect;
}

export const IndexPage: FC = () => {
    const miniApp = useMiniApp();
    const mainButton = useMainButton();
    const initData = useInitData();
    const [accessToken, setAccessToken] = useState('');
    const [id, setId] = useState<number|undefined>();
    const [teamId, setTeamId] = useState<number>(0);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [teamName, setTeamName] = useState('');
    const userObj = useMemo<User | undefined>(() => {

      if (!initData) {
        return;
      }

      const { user } = initData;
      return user;
    }, [initData]);

    const apiUser = useMemo<any>(async() => {
        const user = await AsyncStorage.getItem("UserLogin");
        if ( user != null ) {
          return JSON.parse(user).data;
        }

        return null;
    }, []);

    /**
     * Assign data
     */
    apiUser.then((res: any) => {
      setAccessToken(res.access_token);
      setTeamName(res.user.team_name);
      setName(res.user.name);
      setCode(res.user.code);
      setId(res.user.id);
      setTeamId(res.user.team_id);
    });

    const fetchProducts = async ({ pageParam }: { pageParam: number }) => {
      return await useProductQuery({ accessToken, teamId, pageParam });
    };
  
    /**
     * Fetch products
     */
    // const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    //   useInfiniteQuery({
    //     queryKey: ['query-products'],
    //     queryFn: fetchProducts,
    //     initialPageParam: 1,
    //     getNextPageParam: (lastPage, allPages) => {
    //       const nextPage = allPages.length;
  
    //       if (allPages.length < lastPage?.meta?.last_page) xreturn nextPage + 1;
    //       else return undefined;
    //     },
    //     staleTime: 0,
    //   });
    const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useMemo(() => {
      return useInfiniteQuery({
        queryKey: ['query-products'],
        queryFn: fetchProducts,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
          const nextPage = allPages.length;

          if (allPages.length < lastPage?.meta?.last_page) return nextPage + 1;
          else return undefined;
        },
        staleTime: Infinity,
      });
    });
  
    /**
     * Assign data to products
     */
    const products = data?.pages.map((product) => {
      return product?.data;
    }, []);


    useEffect(() => {
      miniApp.ready();
        /**
         * Runnign to connect ID 
         * and just first time
         */
        connectAPI({
          name: `${userObj?.lastName} ${userObj?.firstName}`,
          email: null,
          phone: null,
          tg_connect_id: userObj?.id,
        });

        mainButton.setParams({
          text: 'Submit',
          textColor: '#aabb01'
        });
    }, []);
  console.log('isFetching', isFetching);
  console.log('accessToken', accessToken);

  if(isFetching) {
    return (
      <>
        <Center>
          <Spinner size="l" />
        </Center>
      </>
    );
  }

  return (
    <ScrollArea onKeyDown={() => console.log("Hello Down")} onScroll={() => console.log("Scrolling...")}>
      <Page title="Dashboard">
        { apiUser != undefined
            ? (
              <>
                <BannerInformationCard
                  id={id}
                  code={code}
                  name={name}
                  teamName={teamName}
                  photoUrl=""
                />
                <Group justify="space-between" mt="xs" mb="xs">
                  {/* Left */}
                  <IconSettings style={{width: rem(20), height: rem(20)}} stroke={1.5} />
                  
                  {/* Right */}
                  <IconScan style={{width: rem(20), height: rem(20)}} stroke={1.5} onClick={() => {
                    scanner.open('Scan the barcode').then((content) => {
                      console.log(content);
                      // Output: 'some-data=22l&app=93...'
                    });
                  }} />
                </Group>
                <PosPage products={products} />
              </>
            ) 
            : <i>Application was launched with missing init data</i> }
      </Page>
    </ScrollArea>
  );
};
