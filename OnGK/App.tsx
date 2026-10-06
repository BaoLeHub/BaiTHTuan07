import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';


import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';


import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';


import MovieCard, {
  Movie,
} from './components/MovieCard';


// ==========================================
// API
// ==========================================

const API =
  'https://68e3a2368e14f4523dae221b.mockapi.io/movies';


// ==========================================
// CẤU HÌNH
// ==========================================

const LIMIT = 10;

const PADDING = 12;

const GAP = 12;


// ==========================================
// MAIN SCREEN
// ==========================================

function MainScreen() {

  // ========================================
  // STATE
  // ========================================

  // Danh sách phim
  const [movies, setMovies] =
    useState<Movie[]>([]);


  // Loading lần đầu
  const [loading, setLoading] =
    useState(true);


  // Pull to refresh
  const [refreshing, setRefreshing] =
    useState(false);


  // Loading thêm trang
  const [loadingMore, setLoadingMore] =
    useState(false);


  // Còn dữ liệu hay không
  const [hasMore, setHasMore] =
    useState(true);


  // Trang bị lỗi
  const [errorPage, setErrorPage] =
    useState<number | null>(null);


  // false = row
  // true = tile

  const [isTile, setIsTile] =
    useState(false);


  // ========================================
  // REF
  // ========================================

  // Trang cuối đã tải thành công

  const pageRef =
    useRef(0);


  // Chặn gọi API trùng

  const isFetchingRef =
    useRef(false);


  // ID của request hiện tại

  const requestIdRef =
    useRef(0);


  // ========================================
  // KÍCH THƯỚC MÀN HÌNH
  // ========================================

  const { width } =
    useWindowDimensions();


  // ========================================
  // SỐ CỘT
  // ========================================

  const numColumns =
    isTile ? 2 : 1;


  // ========================================
  // CHIỀU RỘNG MỖI ITEM
  // ========================================

  const itemWidth =
    (
      width
      - PADDING * 2
      - GAP
    ) / 2;


  // ========================================
  // GỌI API THEO TRANG
  // ========================================

  const fetchPage = async (
    page: number
  ): Promise<Movie[]> => {

    const res =
      await fetch(
        `${API}?page=${page}&limit=${LIMIT}`
      );


    // MockAPI có thể trả 404
    // khi vượt quá dữ liệu

    if (res.status === 404) {

      return [];
    }


    // HTTP lỗi

    if (!res.ok) {

      throw new Error(
        `HTTP ${res.status}`
      );
    }


    // Chuyển response thành JSON

    return res.json();
  };


  // ========================================
  // LOAD PAGE
  // ========================================

  const loadPage = useCallback(
    async (
      page: number,
      mode: 'append' | 'replace'
    ) => {

      // ------------------------------------
      // CHỐNG GỌI TRÙNG
      // ------------------------------------

      if (
        mode === 'append'
        &&
        isFetchingRef.current
      ) {

        return;
      }


      // Đánh dấu đang gọi API

      isFetchingRef.current = true;


      // Tạo request ID mới

      const reqId =
        ++requestIdRef.current;


      // Xóa lỗi cũ

      setErrorPage(null);


      // Nếu đang tải thêm

      if (mode === 'append') {

        setLoadingMore(true);
      }


      try {

        // ----------------------------------
        // GỌI API
        // ----------------------------------

        const data =
          await fetchPage(page);


        // ----------------------------------
        // NẾU REQUEST ĐÃ CŨ
        // ----------------------------------

        if (
          reqId !==
          requestIdRef.current
        ) {

          return;
        }


        // ----------------------------------
        // GHÉP DATA
        // ----------------------------------

        setMovies((prev) => {

          const map =
            new Map<string, Movie>(
              (
                mode === 'replace'
                  ? []
                  : prev
              ).map(
                (movie) => [
                  movie.id,
                  movie,
                ]
              )
            );


            // Thêm dữ liệu mới

            data.forEach(
              (movie) => {

                map.set(
                  movie.id,
                  movie
                );

              }
            );


            // Chuyển Map về array

            return Array.from(
              map.values()
            );

        });


        // Trang tải thành công

        pageRef.current = page;


        // ----------------------------------
        // KIỂM TRA CÒN DỮ LIỆU
        // ----------------------------------

        setHasMore(
          data.length === LIMIT
        );

      }

      catch (error) {

        // ----------------------------------
        // LƯU TRANG BỊ LỖI
        // ----------------------------------

        if (
          reqId ===
          requestIdRef.current
        ) {

          setErrorPage(page);
        }

      }

      finally {

        // ----------------------------------
        // CHỈ RESET REQUEST HIỆN TẠI
        // ----------------------------------

        if (
          reqId ===
          requestIdRef.current
        ) {

          isFetchingRef.current =
            false;

          setLoading(false);

          setRefreshing(false);

          setLoadingMore(false);
        }

      }

    },

    []
  );


  // ========================================
  // LOAD TRANG 1 KHI MỞ APP
  // ========================================

  useEffect(() => {

    loadPage(
      1,
      'replace'
    );

  }, [loadPage]);


  // ========================================
  // INFINITE SCROLL
  // ========================================

  const onEndReached = () => {

    // Không load nếu:

    if (loading) {
      return;
    }


    if (refreshing) {
      return;
    }


    if (!hasMore) {
      return;
    }


    if (errorPage !== null) {
      return;
    }


    // Trang tiếp theo

    loadPage(
      pageRef.current + 1,
      'append'
    );

  };


  // ========================================
  // PULL TO REFRESH
  // ========================================

  const onRefresh = () => {

    // Bật loading refresh

    setRefreshing(true);


    // Cho phép load lại

    setHasMore(true);


    // Load lại từ trang 1

    loadPage(
      1,
      'replace'
    );

  };


  // ========================================
  // MOVIES REF
  // ========================================

  /*
   * Dùng ref để handleSelect
   * không bị tạo lại khi movies thay đổi.
   */

  const moviesRef =
    useRef<Movie[]>([]);


  moviesRef.current =
    movies;


  // ========================================
  // CHỌN PHIM
  // ========================================

  const handleSelect =
    useCallback(
      (id: string) => {

        const movie =
          moviesRef.current.find(
            (item) =>
              item.id === id
          );


        if (movie) {

          Alert.alert(
            `${movie.title} (${movie.year})`
          );

        }

      },
      []
    );


  // ========================================
  // RENDER ITEM
  // ========================================

  const renderItem = ({
    item,
  }: {
    item: Movie;
  }) => (

    <View
      style={
        isTile
          ? {
              width: itemWidth,
            }
          : undefined
      }
    >

      <MovieCard

        movie={item}

        layout={
          isTile
            ? 'tile'
            : 'row'
        }

        onSelect={
          handleSelect
        }

      />

    </View>

  );


  // ========================================
  // FOOTER
  // ========================================

  const renderFooter = () => {

    // --------------------------------------
    // LỖI
    // --------------------------------------

    if (
      errorPage !== null
    ) {

      return (

        <View style={styles.footer}>

          <Text style={styles.error}>

            Tải thất bại

          </Text>


          <Button

            title="Thử lại"

            onPress={() =>

              loadPage(

                errorPage,

                errorPage === 1
                  ? 'replace'
                  : 'append'

              )

            }

          />

        </View>

      );

    }


    // --------------------------------------
    // ĐANG TẢI THÊM
    // --------------------------------------

    if (loadingMore) {

      return (

        <ActivityIndicator
          style={styles.footer}
        />

      );

    }


    // --------------------------------------
    // HẾT DỮ LIỆU
    // --------------------------------------

    if (
      !hasMore
      &&
      movies.length > 0
    ) {

      return (

        <Text style={styles.end}>

          — Đã hết danh sách —

        </Text>

      );

    }


    return null;
  };


  // ========================================
  // GIAO DIỆN
  // ========================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* ==================================
          HEADER
      ================================== */}

      <View style={styles.header}>

        <Text style={styles.title}>

          Movie App

        </Text>


        <View
          style={styles.switchRow}
        >

          <Text>

            Dạng lưới

          </Text>


          <Switch

            value={isTile}

            onValueChange={
              setIsTile
            }

          />

        </View>

      </View>


      {/* ==================================
          LOADING LẦN ĐẦU
      ================================== */}

      {loading ? (

        <ActivityIndicator

          size="large"

          style={{
            flex: 1,
          }}

        />

      ) : (

        /* =================================
           FLATLIST
        ================================= */

        <FlatList

          /*
           * Quan trọng:
           * Khi đổi numColumns,
           * FlatList phải được tạo lại.
           */

          key={
            String(numColumns)
          }


          data={movies}


          numColumns={
            numColumns
          }


          keyExtractor={
            (item) => item.id
          }


          renderItem={
            renderItem
          }


          contentContainerStyle={{
            padding: PADDING,
          }}


          /*
           * Chỉ truyền columnWrapperStyle
           * khi có 2 cột.
           */

          columnWrapperStyle={
            isTile
              ? {
                  gap: GAP,
                }
              : undefined
          }


          /*
           * Infinite Scroll
           */

          onEndReached={
            onEndReached
          }


          onEndReachedThreshold={
            0.5
          }


          /*
           * Footer
           */

          ListFooterComponent={
            renderFooter
          }


          /*
           * Pull to refresh
           */

          refreshControl={

            <RefreshControl

              refreshing={
                refreshing
              }

              onRefresh={
                onRefresh
              }

            />

          }

        />

      )}

    </SafeAreaView>

  );
}


// ==========================================
// APP
// ==========================================

export default function App() {

  return (

    <SafeAreaProvider>

      <MainScreen />

    </SafeAreaProvider>

  );
}


// ==========================================
// STYLE
// ==========================================

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor:
      '#f2f2f2',
  },


  header: {

    paddingHorizontal: 16,

    paddingVertical: 10,

    backgroundColor: '#fff',

    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },


  title: {

    fontSize: 24,

    fontWeight: 'bold',
  },


  switchRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,
  },


  footer: {

    alignItems: 'center',

    padding: 16,
  },


  error: {

    color: 'red',

    marginBottom: 8,
  },


  end: {

    textAlign: 'center',

    padding: 16,

    color: '#888',
  },

});