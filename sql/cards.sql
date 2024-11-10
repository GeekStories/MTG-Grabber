CREATE TABLE public.cards (
    id integer NOT NULL,
    card_id text,
    name text,
    lang text,
    released_at date,
    scryfall_uri text,
    image_status text,
    image_uris jsonb,
    mana_cost text,
    cmc numeric,
    type_line text,
    oracle_text text,
    colors jsonb,
    color_identity jsonb,
    keywords jsonb,
    produced_mana jsonb,
    legalities jsonb,
    set_id text,
    set text,
    set_name text,
    scryfall_set_uri text,
    collector_number text,
    rarity text,
    card_back_id text,
    artist text,
    artist_ids jsonb,
    layout text,
    card_faces jsonb
);

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;