import * as React from "react";
import { useState, useEffect } from "react";
import Modal from "../../../modal";
import { Input } from "../../../textInput";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { FixedSizeList } from "react-window";
import { VerticalGap } from "../../../../style";
import { ButtonDropdown } from "../../../button";
import { CRYPTOCURRENCY_LIST } from "../../../../constants";

export const arraySearch = (array, keyword) => {
  const searchTerm = keyword.toLowerCase();
  return array.filter((value) => {
    return (
      value.name.toLowerCase().match(new RegExp(searchTerm, "g")) ||
      value.address.toLowerCase().match(new RegExp(searchTerm, "g")) ||
      value.symbol.toLowerCase().match(new RegExp(searchTerm, "g"))
    );
  });
};

export function renderRow(props) {
  const { index, style, filteredList, setIsModalOpen, addressInputProps } =
    props;

  return (
    <ListItem
      onClick={(e) => {
        e.preventDefault();
        setIsModalOpen(false);
        addressInputProps.setFieldValue(
          addressInputProps.name,
          filteredList[index]
        );
      }}
      style={style}
      key={index}
      component="div"
      disablePadding
    >
      <ListItemButton>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "20px" }}>{filteredList[index].symbol}</div>
          <div style={{ fontSize: "12px" }}>{filteredList[index].name}</div>
        </div>
      </ListItemButton>
    </ListItem>
  );
}

export default function AddLiquiditySearchCurrencyModal(modalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredList, setFilteredList] = useState({});

  useEffect(() => {
    setFilteredList(
      CRYPTOCURRENCY_LIST.filter((x) => x.address !== modalProps.excludeAddress)
    );
  }, [isModalOpen]);

  const onSearch = (e) => {
    let value = e.target.value;
    if (value.length > 2) {
      let search = arraySearch(filteredList, value);
      setFilteredList(search);
    } else {
      setFilteredList(
        CRYPTOCURRENCY_LIST.filter(
          (x) => x.address !== modalProps.excludeAddress
        )
      );
    }
  };

  return (
    <>
      <Modal {...modalProps} isOpen={isModalOpen}>
        <div
          style={{ display: "flex", flexDirection: "column", padding: "24px" }}
        >
          <div
            style={{ display: "flex", flexDirection: "row", padding: "12px" }}
          >
            <Input onChange={onSearch}></Input>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
            >
              &times;
            </button>
          </div>
          <Box
            sx={{
              width: "100%",
              height: 400,
              maxWidth: 360,
              bgcolor: "background.paper",
            }}
          >
            <FixedSizeList
              height={400}
              width={360}
              itemSize={64}
              itemCount={filteredList.length}
              overscanCount={5}
            >
              {(props) =>
                renderRow({
                  ...props,
                  filteredList,
                  setIsModalOpen,
                  ...modalProps,
                })
              }
            </FixedSizeList>
          </Box>
        </div>
      </Modal>
      <VerticalGap gap="16" />
      <ButtonDropdown
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
      >
        {modalProps?.addressInputProps?.value?.symbol || "Select a token"}
      </ButtonDropdown>
      <VerticalGap gap="16" />
    </>
  );
}