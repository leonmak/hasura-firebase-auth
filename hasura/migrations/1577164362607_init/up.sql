CREATE TABLE public.loved_language (
    name text NOT NULL,
    user_id text NOT NULL
);
CREATE TABLE public.programming_language (
    name text NOT NULL,
    vote_count integer NOT NULL
);
ALTER TABLE ONLY public.loved_language
    ADD CONSTRAINT loved_language_pkey PRIMARY KEY (name, user_id);
ALTER TABLE ONLY public.programming_language
    ADD CONSTRAINT programming_language_pkey PRIMARY KEY (name);
ALTER TABLE ONLY public.loved_language
    ADD CONSTRAINT loved_language_programming_language_fky FOREIGN KEY (name) REFERENCES public.programming_language(name);
