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
      arr.push({
        page: i + 1,
        label: `${i + 1}`
      });
    }
    return arr;
  }, [totalPage]);

  return useMemo(() => {
    return (
      <Row>
        {preButton}
        {pageArray.map((v) => (
          <Text
            key={v.label}
            text={v.label}
            color={pagination.currentPage == v.page ? 'gold' : 'white'}
            onClick={() => {
              if (pagination.currentPage == v.page) {
                return;
              }
              onChange({
                currentPage: v.page,
                pageSize: pagination.pageSize
              });
            }}
          />
        ))}
        {nexButton}
      </Row>
    );
  }, [pagination, preButton, nexButton, pageArray]);
};
