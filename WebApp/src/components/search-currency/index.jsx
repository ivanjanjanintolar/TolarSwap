import * as React from "react";
import { useState, useEffect } from "react";
import Modal from "../modal";
import { Input, TextAreaInput } from "../textInput";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { FixedSizeList } from "react-window";
import { DarkCard } from "../card";
import { VerticalGap, HorizontalGap } from "../../style";
import { Row } from "../row";
import { ButtonDropdown } from "../button";
import { CRYPTOCURRENCY_LIST } from "../../constants";
import Balance from "../balance";

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
        <div>
          <img
            style={{ width: "25px", height: "25px" }}
            src={filteredList[index].logoUrl}
            alt="ethLogo"
          />
        </div>
        <HorizontalGap gap={8} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "18px" }}>{filteredList[index].symbol}</div>
          <div style={{ fontSize: "12px" }}>{filteredList[index].name}</div>
        </div>
      </ListItemButton>
    </ListItem>
  );
}

function SearchCurrencyModal(modalProps) {
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
            <Input onChange={onSearch} placeholder="Paste address here ..."></Input>
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
      <DarkCard>
        <VerticalGap gap="16" />
        <Row>
          {modalProps?.addressInputProps && (
            <div
              style={{
                display: "flex",
                width: "180px",
                height: "48px",
              }}
            >
              <ButtonDropdown
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                {modalProps?.addressInputProps?.value?.symbol && (
                  <img
                    style={{ width: "25px", height: "25px" }}
                    src={modalProps.addressInputProps.value.logoUrl}
                    alt="ethLogo"
                  />
                )}
                <HorizontalGap gap={12} />
                {modalProps?.addressInputProps?.value?.symbol ||
                  "Select a token"}
              </ButtonDropdown>
            </div>
          )}
          {modalProps?.renderLeftComponent()}
          <div
            style={{
              display: "flex",
              width: "240px",
              height: "48px",
            }}
          >
            <TextAreaInput
              placeholder="0.0"
              style={{
                textAlign: "right",
                backgroundColor: "transparent",
                padding: "4px 0px",
                fontSize: "28px",
                position : "relative"
              }}
              onKeyPress={(event) => {
                if (!/[0-9.]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              type="text"
              {...modalProps.currencyInputProps}
            />
          </div>
        </Row>
        {modalProps?.addressInputProps?.value?.symbol && (
          <Balance
            {...modalProps.formProps}
            addressFieldName={modalProps.addressInputProps.name}
            currencyFieldName={modalProps.currencyInputProps.name}
          />
        )}
        <VerticalGap gap="16" />
      </DarkCard>
    </>
  );
}
SearchCurrencyModal.defaultProps = {
  renderLeftComponent: () => {},
};
export default SearchCurrencyModal;