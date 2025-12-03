#!/bin/bash

cd /Users/sxxm/Documents/GitHub/HotelBooker/bookBE/src/main/java/com/hotel/booking

# Auth 패키지 업데이트
find auth -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.auth.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.auth.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.auth.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.auth.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.auth.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\./import com.hotel.booking.auth.dto./g' \
  -e 's/import com\.hotel\.booking\.entity\./import com.hotel.booking.auth.entity./g' \
  -e 's/import com\.hotel\.booking\.repository\./import com.hotel.booking.auth.repository./g' \
  -e 's/import com\.hotel\.booking\.service\./import com.hotel.booking.auth.service./g' \
  -e 's/import com\.hotel\.booking\.util\./import com.hotel.booking.common.util./g' \
  -e 's/import com\.hotel\.booking\.dto\.ApiResponse/import com.hotel.booking.common.dto.ApiResponse/g' \
  {} \;

# Booking 패키지 업데이트
find booking -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.booking.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.booking.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.booking.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.booking.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.booking.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.Booking/import com.hotel.booking.booking.dto.Booking/g' \
  -e 's/import com\.hotel\.booking\.entity\.Booking/import com.hotel.booking.booking.entity.Booking/g' \
  -e 's/import com\.hotel\.booking\.entity\.Room/import com.hotel.booking.room.entity.Room/g' \
  -e 's/import com\.hotel\.booking\.entity\.User/import com.hotel.booking.user.entity.User/g' \
  -e 's/import com\.hotel\.booking\.entity\.Payment/import com.hotel.booking.payment.entity.Payment/g' \
  -e 's/import com\.hotel\.booking\.repository\.Booking/import com.hotel.booking.booking.repository.Booking/g' \
  -e 's/import com\.hotel\.booking\.repository\.Room/import com.hotel.booking.room.repository.Room/g' \
  -e 's/import com\.hotel\.booking\.repository\.User/import com.hotel.booking.user.repository.User/g' \
  -e 's/import com\.hotel\.booking\.repository\.Payment/import com.hotel.booking.payment.repository.Payment/g' \
  -e 's/import com\.hotel\.booking\.repository\.Review/import com.hotel.booking.review.repository.Review/g' \
  -e 's/import com\.hotel\.booking\.util\./import com.hotel.booking.common.util./g' \
  {} \;

# Payment 패키지 업데이트
find payment -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.payment.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.payment.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.payment.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.payment.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.payment.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.Payment/import com.hotel.booking.payment.dto.Payment/g' \
  -e 's/import com\.hotel\.booking\.entity\.Payment/import com.hotel.booking.payment.entity.Payment/g' \
  -e 's/import com\.hotel\.booking\.entity\.Booking/import com.hotel.booking.booking.entity.Booking/g' \
  -e 's/import com\.hotel\.booking\.repository\.Payment/import com.hotel.booking.payment.repository.Payment/g' \
  -e 's/import com\.hotel\.booking\.repository\.Booking/import com.hotel.booking.booking.repository.Booking/g' \
  -e 's/import com\.hotel\.booking\.util\./import com.hotel.booking.common.util./g' \
  {} \;

# Review 패키지 업데이트
find review -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.review.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.review.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.review.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.review.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.review.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.Review/import com.hotel.booking.review.dto.Review/g' \
  -e 's/import com\.hotel\.booking\.entity\.Review/import com.hotel.booking.review.entity.Review/g' \
  -e 's/import com\.hotel\.booking\.entity\.Booking/import com.hotel.booking.booking.entity.Booking/g' \
  -e 's/import com\.hotel\.booking\.entity\.Room/import com.hotel.booking.room.entity.Room/g' \
  -e 's/import com\.hotel\.booking\.entity\.User/import com.hotel.booking.user.entity.User/g' \
  -e 's/import com\.hotel\.booking\.repository\.Review/import com.hotel.booking.review.repository.Review/g' \
  -e 's/import com\.hotel\.booking\.repository\.Booking/import com.hotel.booking.booking.repository.Booking/g' \
  -e 's/import com\.hotel\.booking\.repository\.Room/import com.hotel.booking.room.repository.Room/g' \
  -e 's/import com\.hotel\.booking\.repository\.User/import com.hotel.booking.user.repository.User/g' \
  -e 's/import com\.hotel\.booking\.util\./import com.hotel.booking.common.util./g' \
  {} \;

# Room 패키지 업데이트
find room -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.room.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.room.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.room.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.room.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.room.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.Room/import com.hotel.booking.room.dto.Room/g' \
  -e 's/import com\.hotel\.booking\.entity\.Room/import com.hotel.booking.room.entity.Room/g' \
  -e 's/import com\.hotel\.booking\.repository\.Room/import com.hotel.booking.room.repository.Room/g' \
  {} \;

# User 패키지 업데이트
find user -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.user.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.user.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.user.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.user.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.user.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.User/import com.hotel.booking.user.dto.User/g' \
  -e 's/import com\.hotel\.booking\.entity\.User/import com.hotel.booking.user.entity.User/g' \
  -e 's/import com\.hotel\.booking\.repository\.User/import com.hotel.booking.user.repository.User/g' \
  -e 's/import com\.hotel\.booking\.util\./import com.hotel.booking.common.util./g' \
  {} \;

# Notice 패키지 업데이트
find notice -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.controller;/package com.hotel.booking.notice.controller;/g' \
  -e 's/^package com\.hotel\.booking\.service;/package com.hotel.booking.notice.service;/g' \
  -e 's/^package com\.hotel\.booking\.repository;/package com.hotel.booking.notice.repository;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.notice.dto;/g' \
  -e 's/^package com\.hotel\.booking\.entity;/package com.hotel.booking.notice.entity;/g' \
  -e 's/import com\.hotel\.booking\.dto\.Notice/import com.hotel.booking.notice.dto.Notice/g' \
  -e 's/import com\.hotel\.booking\.entity\.Notice/import com.hotel.booking.notice.entity.Notice/g' \
  -e 's/import com\.hotel\.booking\.repository\.Notice/import com.hotel.booking.notice.repository.Notice/g' \
  {} \;

# Common 패키지 업데이트
find common -name "*.java" -exec sed -i '' \
  -e 's/^package com\.hotel\.booking\.exception;/package com.hotel.booking.common.exception;/g' \
  -e 's/^package com\.hotel\.booking\.security;/package com.hotel.booking.common.security;/g' \
  -e 's/^package com\.hotel\.booking\.util;/package com.hotel.booking.common.util;/g' \
  -e 's/^package com\.hotel\.booking\.config;/package com.hotel.booking.common.config;/g' \
  -e 's/^package com\.hotel\.booking\.dto;/package com.hotel.booking.common.dto;/g' \
  {} \;

echo "Package updates completed"

