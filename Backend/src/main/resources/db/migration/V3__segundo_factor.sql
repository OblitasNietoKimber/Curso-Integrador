ALTER TABLE usuarios ADD COLUMN totp_secret VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN totp_counter BIGINT;
ALTER TABLE usuarios ADD COLUMN totp_recovery TEXT;
