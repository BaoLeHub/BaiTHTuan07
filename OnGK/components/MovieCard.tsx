import React from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


// ==========================================
// KIỂU DỮ LIỆU MOVIE
// ==========================================

export type Movie = {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  poster: string;
  isWatched: boolean;
};


// ==========================================
// PROPS CỦA MOVIECARD
// ==========================================

export type MovieCardProps = {
  movie: Movie;

  layout?: 'row' | 'tile';

  onSelect: (id: string) => void;
};


// ==========================================
// COMPONENT
// ==========================================

function MovieCard({
  movie,
  layout = 'row',
  onSelect,
}: MovieCardProps) {

  // Kiểm tra đang ở dạng tile hay row
  const isTile = layout === 'tile';


  // Rating luôn hiển thị 1 số thập phân
  // Ví dụ:
  // 9 -> 9.0
  // 8.5 -> 8.5
  const ratingText =
    `⭐ ${movie.rating.toFixed(1)}`;


  return (
    <TouchableOpacity
      activeOpacity={0.7}

      onPress={() => onSelect(movie.id)}

      style={[
        styles.card,

        isTile && styles.cardTile,
      ]}
    >

      {/* =====================================
          PHẦN POSTER
      ===================================== */}

      <View
        style={
          isTile
            ? styles.posterBoxTile
            : undefined
        }
      >

        <Image
          source={{
            uri: movie.poster,
          }}

          style={[
            styles.poster,

            isTile &&
              styles.posterTile,
          ]}
        />


        {/* Rating nằm trên ảnh khi dạng tile */}

        {isTile && (
          <Text style={styles.badge}>
            {ratingText}
          </Text>
        )}

      </View>


      {/* =====================================
          THÔNG TIN PHIM
      ===================================== */}

      <View
        style={[
          styles.info,

          isTile &&
            styles.infoTile,
        ]}
      >

        {/* Tên phim */}

        <Text
          style={styles.title}

          numberOfLines={
            isTile ? 1 : 2
          }
        >
          {movie.title}
        </Text>


        {/* Thể loại + năm
            Chỉ hiển thị dạng row */}

        {!isTile && (
          <Text style={styles.meta}>
            {movie.genre} • {movie.year}
          </Text>
        )}


        {/* Rating
            Chỉ hiển thị dạng row */}

        {!isTile && (
          <Text style={styles.rating}>
            {ratingText}
          </Text>
        )}


        {/* Trạng thái */}

        <Text style={styles.status}>
          {
            movie.isWatched
              ? '✅ Đã xem'
              : '⏳ Chưa xem'
          }
        </Text>

      </View>

    </TouchableOpacity>
  );
}


// ==========================================
// REACT MEMO
// ==========================================

export default React.memo(MovieCard);


// ==========================================
// STYLE
// ==========================================

const styles = StyleSheet.create({

  // ----------------------------------------
  // ROW - 1 CỘT
  // ----------------------------------------

  card: {

    flexDirection: 'row',

    backgroundColor: '#fff',

    borderRadius: 10,

    padding: 8,

    marginBottom: 10,

    elevation: 2,

    shadowColor: '#000',

    shadowOpacity: 0.1,

    shadowRadius: 4,
  },


  // Poster dạng row

  poster: {

    width: 70,

    height: 100,

    borderRadius: 6,
  },


  // Thông tin dạng row

  info: {

    flex: 1,

    marginLeft: 10,

    justifyContent: 'center',
  },


  title: {

    fontSize: 16,

    fontWeight: 'bold',
  },


  meta: {

    color: '#666',

    marginTop: 2,
  },


  rating: {

    marginTop: 4,

    color: '#e69500',

    fontWeight: '600',
  },


  status: {

    marginTop: 4,
  },


  // ----------------------------------------
  // TILE - 2 CỘT
  // ----------------------------------------

  cardTile: {

    flexDirection: 'column',

    padding: 0,

    overflow: 'hidden',
  },


  posterBoxTile: {

    width: '100%',
  },


  posterTile: {

    width: '100%',

    height: undefined,

    aspectRatio: 2 / 3,

    borderRadius: 0,
  },


  // ----------------------------------------
  // RATING TRÊN ẢNH
  // ----------------------------------------

  badge: {

    position: 'absolute',

    top: 6,

    right: 6,

    backgroundColor:
      'rgba(0,0,0,0.65)',

    color: '#fff',

    paddingHorizontal: 6,

    paddingVertical: 2,

    borderRadius: 6,

    fontSize: 12,

    fontWeight: 'bold',
  },


  // ----------------------------------------
  // INFO TILE
  // ----------------------------------------

  infoTile: {

    marginLeft: 0,

    padding: 8,
  },

});