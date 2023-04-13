/* eslint-disable indent */
import { useMemo } from 'react';

import { Row } from '../Row';
import { Text } from '../Text';

interface Pagination {
  currentPage: number;
  pageSize: number;
}
interface PaginationProps {
  pagination: Pagination;
  total: number;
  onChange: (pagination: Pagination) => void;
}
export const Pagination = (props: PaginationProps) => {
  const { pagination, total, onChange } = props;

  const totalPage = Math.ceil(total / pagination.pageSize);
  const preButton = useMemo(() => {
    if (pagination.currentPage == 1) {
      return <Text text="<" style={{ cursor: 'not-allowed' }} color="textDim" />;
    } else {
      return (
        <Text
          text="<"
          onClick={() => {
            onChange({
              currentPage: pagination.currentPage - 1,
              pageSize: pagination.pageSize
            });
          }}
        />
      );
    }
  }, [totalPage, pagination]);

  const nexButton = useMemo(() => {
    if (pagination.currentPage == totalPage) {
      return <Text text=">" style={{ cursor: 'not-allowed' }} color="textDim" />;
    } else {
      return (
        <Text
          text=">"
          onClick={() => {
            onChange({
              currentPage: pagination.currentPage + 1,
              pageSize: pagination.pageSize
            });
          }}
        />
      );
    }
  }, [totalPage, pagination]);

  const pageArray = useMemo(() => {
    const arr: { page: number; label: string }[] = [];
    for (let i = 0; i < totalPage; i++) {
      const page = i + 1;
      const current = pagination.currentPage;
      let start = Math.max(current - 2, 1);
      let end = Math.min(current + 2, totalPage);
      if (end - current < 2) {
        start -= 2 - (end - current);
      }
      if (current - start < 2) {
        end += 2 - (current - start);
      }
      if (page == 1 || page == totalPage) {
        arr.push({
          page,
          label: `${page}`
        });
        continue;
      }

      if (page >= start && page <= end) {
        arr.push({
          page: page,
          label: `${page}`
        });
      } else if (page == 2 || page == totalPage - 1) {
        arr.push({
          page: -1,
          label: '...'
        });
      }
    }
    return arr;
  }, [totalPage, pagination.currentPage]);

  return useMemo(() => {
    return (
      <Row>
        {preButton}
        {pageArray.map((v) => (
          <Text
            key={v.label}
            text={v.label}
            style={{ width: 18 }}
            textCenter
            color={pagination.currentPage == v.page ? 'gold' : 'white'}
            onClick={
              v.page == -1
                ? undefined
                : () => {
                    if (pagination.currentPage == v.page) {
                      return;
                    }
                    onChange({
                      currentPage: v.page,
                      pageSize: pagination.pageSize
                    });
                  }
            }
          />
        ))}
        {nexButton}
      </Row>
    );
  }, [pagination, preButton, nexButton, pageArray]);
};
