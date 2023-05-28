--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-05-28 16:27:58 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3651 (class 1262 OID 16390)
-- Name: teamgenetix; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE teamgenetix WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


ALTER DATABASE teamgenetix OWNER TO postgres;

\connect teamgenetix

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3652 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16391)
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id integer NOT NULL,
    username character varying,
    password character varying,
    fullname character varying,
    email character varying,
    street character varying,
    city character varying,
    zip integer,
    phone character varying,
    picture character varying,
    steam character varying,
    origin character varying,
    riotgames character varying,
    battlenet character varying,
    loginattempts smallint DEFAULT 0,
    blocked boolean DEFAULT false,
    resetpasswordtoken character varying,
    resetpasswordexpires bigint
);


ALTER TABLE public.account OWNER TO postgres;

--
-- TOC entry 3653 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.username IS 'Username of the account';


--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.password IS 'Hased password';


--
-- TOC entry 3655 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.picture; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.picture IS 'Profile Picture in base64 format';


--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.loginattempts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.loginattempts IS 'How many invalid login attempts had the user? After 5 user gets blocked';


--
-- TOC entry 3657 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.blocked; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.blocked IS 'Is the user blocked?';


--
-- TOC entry 3658 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.resetpasswordtoken; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.resetpasswordtoken IS 'The password reset token is stored here if the user genereates one';


--
-- TOC entry 3659 (class 0 OID 0)
-- Dependencies: 214
-- Name: COLUMN account.resetpasswordexpires; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.account.resetpasswordexpires IS 'The epoch time when the token expires';


--
-- TOC entry 215 (class 1259 OID 16396)
-- Name: presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presence (
    id integer NOT NULL,
    account_fk integer,
    date bigint,
    state smallint,
    comment character varying,
    "from" character varying,
    until character varying
);


ALTER TABLE public.presence OWNER TO postgres;

--
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN presence.date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.presence.date IS 'Epoch timestamp on which date this presence occures';


--
-- TOC entry 3661 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN presence.state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.presence.state IS '0 = Present, 1 = Open, 2 = Absent, 3 = Unsure';


--
-- TOC entry 3662 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN presence.comment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.presence.comment IS 'Comment (currently only used if state = 3)';


--
-- TOC entry 3663 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN presence."from"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.presence."from" IS 'from when the presence is';


--
-- TOC entry 3664 (class 0 OID 0)
-- Dependencies: 215
-- Name: COLUMN presence.until; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.presence.until IS 'until when the presence is';


--
-- TOC entry 216 (class 1259 OID 16401)
-- Name: registrationcode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrationcode (
    id integer NOT NULL,
    code character varying,
    used boolean,
    validuntil bigint,
    teamtype_fk integer
);


ALTER TABLE public.registrationcode OWNER TO postgres;

--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 216
-- Name: COLUMN registrationcode.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.registrationcode.code IS 'The Registration Code';


--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 216
-- Name: COLUMN registrationcode.used; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.registrationcode.used IS 'Is the code unused?';


--
-- TOC entry 3667 (class 0 OID 0)
-- Dependencies: 216
-- Name: COLUMN registrationcode.validuntil; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.registrationcode.validuntil IS 'The epoch Timestamp until when the code is valid';


--
-- TOC entry 217 (class 1259 OID 16406)
-- Name: registrationcode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrationcode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registrationcode_id_seq OWNER TO postgres;

--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 217
-- Name: registrationcode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrationcode_id_seq OWNED BY public.registrationcode.id;


--
-- TOC entry 218 (class 1259 OID 16407)
-- Name: team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team (
    id integer NOT NULL,
    displayname character varying,
    weight smallint,
    teamtype_fk integer
);


ALTER TABLE public.team OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16412)
-- Name: team_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_id_seq OWNER TO postgres;

--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 219
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
-- TOC entry 220 (class 1259 OID 16413)
-- Name: teamcalendar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teamcalendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teamcalendar_id_seq OWNER TO postgres;

--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 220
-- Name: teamcalendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teamcalendar_id_seq OWNED BY public.presence.id;


--
-- TOC entry 221 (class 1259 OID 16414)
-- Name: teammembership; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teammembership (
    id integer NOT NULL,
    account_fk integer,
    team_fk integer
);


ALTER TABLE public.teammembership OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16417)
-- Name: teammembership_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teammembership_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teammembership_id_seq OWNER TO postgres;

--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 222
-- Name: teammembership_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teammembership_id_seq OWNED BY public.teammembership.id;


--
-- TOC entry 223 (class 1259 OID 16418)
-- Name: teamtype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teamtype (
    id integer NOT NULL,
    name character varying,
    displayname character varying
);


ALTER TABLE public.teamtype OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16423)
-- Name: teamtype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teamtype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teamtype_id_seq OWNER TO postgres;

--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 224
-- Name: teamtype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teamtype_id_seq OWNED BY public.teamtype.id;


--
-- TOC entry 225 (class 1259 OID 16424)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public.account.id;


--
-- TOC entry 3488 (class 2604 OID 16425)
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 16426)
-- Name: presence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presence ALTER COLUMN id SET DEFAULT nextval('public.teamcalendar_id_seq'::regclass);


--
-- TOC entry 3492 (class 2604 OID 16427)
-- Name: registrationcode id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrationcode ALTER COLUMN id SET DEFAULT nextval('public.registrationcode_id_seq'::regclass);


--
-- TOC entry 3493 (class 2604 OID 16428)
-- Name: team id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 16429)
-- Name: teammembership id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teammembership ALTER COLUMN id SET DEFAULT nextval('public.teammembership_id_seq'::regclass);


--
-- TOC entry 3495 (class 2604 OID 16430)
-- Name: teamtype id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamtype ALTER COLUMN id SET DEFAULT nextval('public.teamtype_id_seq'::regclass);


--
-- TOC entry 3499 (class 2606 OID 16435)
-- Name: registrationcode registrationcode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrationcode
    ADD CONSTRAINT registrationcode_pkey PRIMARY KEY (id);


--
-- TOC entry 3497 (class 2606 OID 16437)
-- Name: presence teamcalendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presence
    ADD CONSTRAINT teamcalendar_pkey PRIMARY KEY (id);


--
-- TOC entry 3501 (class 2606 OID 16439)
-- Name: teammembership teammembership_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teammembership
    ADD CONSTRAINT teammembership_pkey PRIMARY KEY (id);


--
-- TOC entry 3503 (class 2606 OID 16441)
-- Name: teamtype teamtype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teamtype
    ADD CONSTRAINT teamtype_pkey PRIMARY KEY (id);


-- Completed on 2023-05-28 16:28:00 CEST

--
-- PostgreSQL database dump complete
--

